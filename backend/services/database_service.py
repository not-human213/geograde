from typing import Dict, Optional
from mysql.connector import connect
from config.database import get_db_connection
from utils.constants import DATABASE_BASE_VALUES
import logging
from services.olamaps_service import OlaMapsService
from services.report_service import ReportService

class DatabaseService:
    def __init__(self):
        self.db = get_db_connection()
        self.olamaps_service = OlaMapsService()
        self.cursor = self.db.cursor(dictionary=True)
        self.report_service = ReportService()

    def get_total_crime(self, city):
        try:
            logging.info(f"Fetching crime data for city: {city}")
            city = city.split(" ")[0]
            search_pattern = f"%{city.lower()}%"


            crime_query = """
                SELECT SUM(`Total`)
                FROM crime WHERE LOWER(District) LIKE %s;
                """
            self.cursor.execute(crime_query, (search_pattern))
            crime_data = self.cursor.fetchone()
            print("crime datadsdfdsfas", crime_data)
            pop_query = """
                SELECT TOT_P from india_district_population where LOWER(District) LIKE %s;
                    """
            
            self.cursor.execute(pop_query, (search_pattern))

            pop_data = self.cursor.fetchone()
            logging.info(f"populatriondsofjdsfdsfed: {pop_data}")
            # Return a dictionary with the crime count
            data = {
                'crime_count': crime_data['Total_Crimes'] if crime_data['Total_Crimes'] else None,
                'pop_count' : pop_data['TOT_P'] if pop_data['TOT_P'] else None
            }
            return data
        except Exception as e:
            logging.error(f"Error in get_total_crime: {str(e)}")
            return None
    
    def get_total_forest_cover(self, state):
        try:
            logging.info(f"Fetching forest cover data for state: {state}")
            forest_query = """
                SELECT `Forest Cover`, `Tree Cover`, `Total Forest cover & Tree Cover` as total_green_cover
                FROM forestcover_2021
                WHERE LOWER(`State/UT`) = LOWER(%s)
                """
            self.cursor.execute(forest_query, (state,))
            forest_data = self.cursor.fetchone()
            logging.info(f"Forest data retrieved: {forest_data}")
            return forest_data
        except Exception as e:
            logging.error(f"Error in get_total_forest_cover: {str(e)}")
            return None
    
    def get_gdp(self, city):
        try:
            city = city.lower()
            city = city.split(" ")[0]
            logging.info(f"Fetching GDP data for city: {city}")
            gdp_query = f"""
                SELECT Year, `{city}` as city_gdp
                FROM geograde.gdp
                where year = 2023
                AND `{city}` LIKE `{city}`;
                """
            self.cursor.execute(gdp_query)  # No parameters needed as we're using formatted string
            gdp_data = self.cursor.fetchone()
            logging.info(f"GDP data retrieved: {gdp_data}")
            
            # Convert to proper format for score calculation
            if gdp_data and gdp_data['city_gdp'] is not None:
                return {
                    'year': gdp_data['Year'],
                    'per_capita_gdp': float(gdp_data['city_gdp'])
                }
            return None
        except Exception as e:
            logging.error(f"Error in get_gdp: {str(e)}")
            return None
    
    def get_per_income(self, state):
        try:
            state = state.lower()
            logging.info(f"Fetching per capita income data for state: {state}")
            income_query = """
                SELECT Per_cap_income
                FROM percapitaincome
                WHERE LOWER(`State`) = %s;
                """
            self.cursor.execute(income_query, (state,))
            income_data = self.cursor.fetchone()
            logging.info(f"Income data retrieved: {income_data}")
            return income_data
        except Exception as e:
            logging.error(f"Error in get_per_income: {str(e)}")
            return None
        
    def get_per_consumption(self, state):
        try:
            state = state.lower()
            logging.info(f"Fetching per capita consumption data for state: {state}")
            consumption_query = """
                SELECT Per_cap_consump
213`45  qw6EASrz               FROM percapitaconsumption
                WHERE LOWER(`State`) = %s;
                """
            self.cursor.execute(consumption_query, (state,))
            consumption_data = self.cursor.fetchone()
            logging.info(f"Consumption data retrieved: {consumption_data}")
            return consumption_data
        except Exception as e:
            logging.error(f"Error in get_per_consumption: {str(e)}")
            return None

    def calculate_per_capita_consumption_score(self, consumption_data: Dict) -> float:
        try:
            if not consumption_data:
                logging.warning("No consumption data available for scoring")
                return 0
            
            per_capita_consumption = float(consumption_data['Per Capita Consumption'])
            ideal_consumption = DATABASE_BASE_VALUES['energy_comsumption   ']['ideal_per_capita']
            min_consumption = DATABASE_BASE_VALUES['energy_comsumption']['min_per_capita']
            
            score = (per_capita_consumption - min_consumption) / (ideal_consumption - min_consumption) * 100
            score = max(min(score, 100), 0)
            logging.info(f"Calculated consumption score: {score}")
            return score
        except Exception as e:
            logging.error(f"Error in calculate_per_capita_consumption_score: {str(e)}")

    def calculate_income_score(self, income_data: Dict) -> float:
        try:
            if not income_data:
                logging.warning("No income data available for scoring")
                return 0
            
            per_capita_income = float(income_data['Per Capita Income'])
            ideal_income = DATABASE_BASE_VALUES['income']['ideal_per_capita']
            min_income = DATABASE_BASE_VALUES['income']['min_per_capita']
            
            score = (per_capita_income - min_income) / (ideal_income - min_income) * 100
            score = max(min(score, 100), 0)
            logging.info(f"Calculated income score: {score}")
            return score
        except Exception as e:
            logging.error(f"Error in calculate_income_score: {str(e)}")
            return 0

    def calculate_forest_score(self, forest_data: Dict) -> float:
        try:
            if not forest_data or 'Forest Cover' not in forest_data:
                logging.warning("No forest data available for scoring")
                return 0
            
            forest_percentage = float(forest_data['Forest Cover'])
            ideal_percentage = DATABASE_BASE_VALUES['forest_cover']['ideal_percentage']
            min_percentage = DATABASE_BASE_VALUES['forest_cover']['min_percentage']
            
            score = (forest_percentage - min_percentage) / (ideal_percentage - min_percentage) * 100
            score = max(min(score, 100), 0)
            logging.info(f"Calculated forest score: {score}")
            return score
        except Exception as e:
            logging.error(f"Error in calculate_forest_score: {str(e)}")
            return 0

    def calculate_crime_score(self, data: Dict, population: int) -> float:
        try:
            if not data:
                logging.warning("No crime data available for scoring")
                return 0
            
            crimes_per_lakh = (float(data['crime_count']) / data['pop_data']) * 100000
            max_crimes = DATABASE_BASE_VALUES['crime_rate']['max_crimes_per_lakh']
            min_crimes = DATABASE_BASE_VALUES['crime_rate']['min_crimes_per_lakh']
            
            score = (max_crimes - crimes_per_lakh) / (max_crimes - min_crimes) * 100
            score = max(min(score, 100), 0)
            logging.info(f"Calculated crime score: {score}")
            return score
        except Exception as e:
            logging.error(f"Error in calculate_crime_score: {str(e)}")
            return 0

    def calculate_gdp_score(self, gdp_data: Dict) -> float:
        try:
            print(gdp_data)
            if not gdp_data:
                logging.warning("No GDP data available for scoring")
                return 0
            
            per_capita_gdp = float(gdp_data['per_capita_gdp'])
            ideal_gdp = DATABASE_BASE_VALUES['gdp']['ideal_per_capita']
            min_gdp = DATABASE_BASE_VALUES['gdp']['min_per_capita']
            
            score = (per_capita_gdp - min_gdp) / (ideal_gdp - min_gdp) * 100
            score = max(min(score, 100), 0)
            logging.info(f"Calculated GDP score: {score}")
            return score
        except Exception as e:
            logging.error(f"Error in calculate_gdp_score: {str(e)}")
            return 0

    def get_hdi(self, state):
        try:
            state = state.lower()
            logging.info(f"Fetching HDI data for state: {state}")
            hdi_query = """
                SELECT HDI
                FROM hdi
                WHERE LOWER(`State`) = %s;
                """
            self.cursor.execute(hdi_query, (state,))
            hdi_data = self.cursor.fetchone()
            logging.info(f"HDI data retrieved: {hdi_data}")
            return hdi_data
        except Exception as e:
            logging.error(f"Error in get_hdi: {str(e)}")
            return None

    def calculate_hdi_score(self, hdi_data: Dict) -> float:
        try:
            if not hdi_data or 'HDI' not in hdi_data:
                logging.warning("No HDI data available for scoring")
                return 0
            
            hdi_value = float(hdi_data['HDI'])
            ideal_hdi = DATABASE_BASE_VALUES['hdi']['ideal_score']
            min_hdi = DATABASE_BASE_VALUES['hdi']['min_score']
            
            # HDI is already on a 0-1 scale, convert to 0-100
            score = (hdi_value - min_hdi) / (ideal_hdi - min_hdi) * 100
            score = max(min(score, 100), 0)
            logging.info(f"Calculated HDI score: {score}")
            return score
        except Exception as e:
            logging.error(f"Error in calculate_hdi_score: {str(e)}")
            return 0

    def get_area_data(self, admin_level) -> Dict:
        """Get IPC crimes and forest cover data for a given location"""
        try:
            logging.info(f"Processing area data for admin_level: {admin_level}")
            
            city = admin_level['city']
            state = admin_level['state']
            
            logging.info(f"Fetching data for city: {city}, state: {state}")
            
            crime_data = self.get_total_crime(city)
            forest_data = self.get_total_forest_cover(state)
            gdp_data = self.get_gdp(city)
            hdi_data = self.get_hdi(state)
            
            # Calculate scores
            forest_score = self.calculate_forest_score(forest_data)
            crime_score = self.calculate_crime_score(crime_data, 1000000)
            gdp_score = self.calculate_gdp_score(gdp_data)
            hdi_score = self.calculate_hdi_score(hdi_data)
            
            result = {
                'location': {
                    'city': city,
                    'state': state
                },
                'crime_data': {
                    'total_cognizable_crimes': crime_data['crime_count'] if crime_data else None,
                    'score': crime_score
                },
                'environmental_data': {
                    'forest_cover': forest_data['Forest Cover'] if forest_data else None,
                    'tree_cover': forest_data['Tree Cover'] if forest_data else None,
                    'total_green_cover': forest_data['total_green_cover'] if forest_data else None,
                    'score': forest_score
                },
                'economic_data': {
                    'gdp': gdp_data if gdp_data else None,
                    'score': gdp_score
                },
                'hdi_data': {
                    'hdi': hdi_data['HDI'] if hdi_data else None,
                    'score': hdi_score
                }
            }
            
            logging.info(f"Successfully processed area data: {result}")
            return result
            
        except Exception as e:
            logging.error(f"Error in get_area_data: {str(e)}")
            logging.error(f"Admin level data: {admin_level}")
            return None

    def close(self):
        try:
            if self.cursor:
                self.cursor.close()
            if self.db:
                self.db.close()
            if hasattr(self, 'report_service'):
                self.report_service.close()
            logging.info("Database connections closed successfully")
        except Exception as e:
            logging.error(f"Error closing database connections: {str(e)}") 