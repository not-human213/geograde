from typing import Dict, List, Tuple
from mysql.connector import connect
from config.database import get_db_connection
import logging
from passlib.context import CryptContext

class ReportService:
    def __init__(self):
        try:
            self.db = get_db_connection()
            self.cursor = self.db.cursor(dictionary=True)
            self.pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        except Exception as e:
            logging.error(f"Error initializing ReportService: {str(e)}")
            raise

    def submit_report(self, latitude: float, longitude: float, reports: Dict[str, int], level3: str) -> bool:
        try:
            # First check if there's an existing report for this level3
            existing_report = self.get_existing_report(level3)
            print(existing_report)
            if existing_report:
                # Update existing report
                update_fields = []
                update_values = []
                
                for field, value in reports.items():
                    update_fields.append(f"{field} = {field} + %s")
                    update_values.append(value)
                
                update_query = f"""
                    UPDATE area_reports 
                    SET {', '.join(update_fields)}
                    WHERE level3 = %s
                """
                self.cursor.execute(update_query, update_values + [existing_report['level3']])
            else:
                # Insert new report
                fields = list(reports.keys()) + ['level3']
                placeholders = ', '.join(['%s'] * (len(reports) + 1))
                query = f"""
                    INSERT INTO area_reports (latitude, longitude, {', '.join(fields)})
                    VALUES (%s, %s, {placeholders})
                """
                values = [latitude, longitude] + list(reports.values()) + [level3]
                self.cursor.execute(query, values)

            self.db.commit()
            return True
        except Exception as e:
            logging.error(f"Error submitting report: {str(e)}")
            return False

    def get_existing_report(self, level3: str) -> Dict:
        try:
            query = """
                SELECT *
                FROM area_reports
                WHERE level3 = %s
                ORDER BY created_at DESC
                LIMIT 1
            """
            self.cursor.execute(query, (level3,))
            return self.cursor.fetchone()
        except Exception as e:
            logging.error(f"Error getting existing report: {str(e)}")
            return None

    def get_nearby_reports(self, level3: str) -> List[Dict]:
        try:
            query = """
                SELECT *
                FROM area_reports
                WHERE level3 = %s
                ORDER BY created_at DESC
            """
            self.cursor.execute(query, (level3,))
            reports = self.cursor.fetchall()
            return reports
        except Exception as e:
            logging.error(f"Error getting nearby reports: {str(e)}")
            return None

    def calculate_report_score(self, reports: List[Dict]) -> float:
        try:
            if not reports:
                return 50  # Neutral score if no reports

            total_score = 0
            max_possible_score = 0

            for report in reports:
                # Calculate weight based on distance (closer reports have more weight)
                distance_weight = 1 - (report['distance'] / 5000) 
                
                # Calculate positive and negative scores
                positive_sum = sum(max(0, report[field]) for field in report 
                                 if field not in ['id', 'latitude', 'longitude', 'distance', 'created_at', 'updated_at'])
                negative_sum = sum(min(0, report[field]) for field in report 
                                 if field not in ['id', 'latitude', 'longitude', 'distance', 'created_at', 'updated_at'])
                
                # Add weighted scores
                total_score += (positive_sum + negative_sum) * distance_weight
                max_possible_score += (abs(positive_sum) + abs(negative_sum)) * distance_weight

            if max_possible_score == 0:
                return 50

            # Convert to 0-100 scale
            normalized_score = ((total_score / max_possible_score) + 1) * 50
            return max(min(normalized_score, 100), 0)

        except Exception as e:
            logging.error(f"Error calculating report score: {str(e)}")
            return 50 

    def close(self):
        try:
            if hasattr(self, 'cursor'):
                self.cursor.close()
            if hasattr(self, 'db'):
                self.db.close()
        except Exception as e:
            logging.error(f"Error closing report service connections: {str(e)}") 

    def create_user(self, email: str, password: str) -> Dict:
        try:
            # Check if user already exists
            self.cursor.execute("SELECT id FROM users WHERE email = %s", (email,))
            if self.cursor.fetchone():
                return {"success": False, "message": "Email already registered"}

            try:
                # Hash password and create user
                password_hash = self.pwd_context.hash(password)
                query = "INSERT INTO users (email, password_hash) VALUES (%s, %s)"
                self.cursor.execute(query, (email, password_hash))
                self.db.commit()
                
                return {"success": True, "message": "User created successfully"}
            except Exception as e:
                logging.error(f"Error hashing password: {str(e)}")
                return {"success": False, "message": "Error creating user"}

        except Exception as e:
            logging.error(f"Error creating user: {str(e)}")
            return {"success": False, "message": "Error creating user"}

    def verify_user(self, email: str, password: str) -> Dict:
        try:
            # Get user from database
            query = "SELECT id, email, password_hash FROM users WHERE email = %s"
            self.cursor.execute(query, (email,))
            user = self.cursor.fetchone()

            if not user:
                return {"success": False, "message": "Invalid email or password"}

            try:
                is_valid = self.pwd_context.verify(password, user['password_hash'])
                if not is_valid:
                    return {"success": False, "message": "Invalid email or password"}
            except Exception as e:
                logging.error(f"Error verifying password: {str(e)}")
                return {"success": False, "message": "Error verifying password"}

            return {
                "success": True,
                "message": "Login successful",
                "user_id": user['id'],
                "email": user['email']
            }
        except Exception as e:
            logging.error(f"Error verifying user: {str(e)}")
            return {"success": False, "message": "Error during login"} 

    def get_location_reports(self, level3: str) -> List[Dict]:
        try:
            query = """
                SELECT *
                FROM area_reports 
                WHERE level3 = %s
                ORDER BY created_at DESC
            """
            self.cursor.execute(query, (level3,))
            reports = self.cursor.fetchall()
            
            if not reports:
                return []
            
            # Convert reports to a more readable format
            formatted_reports = []
            for report in reports:
                report_dict = {
                    'latitude': float(report['latitude']),
                    'longitude': float(report['longitude']),
                    'level3': report['level3'],
                    'created_at': report['created_at'],
                    'ratings': {}
                }
                
                # Add all non-null ratings
                for key, value in report.items():
                    if key not in ['id', 'latitude', 'longitude', 'level3', 'created_at'] and value is not None:
                        report_dict['ratings'][key] = value
                        
                formatted_reports.append(report_dict)
                
            return formatted_reports
        except Exception as e:
            logging.error(f"Error getting location reports: {str(e)}")
            return [] 

    def get_area_stories(self, level3: str) -> List[Dict]:
        try:
            query = """
                SELECT *
                FROM area_stories
                WHERE level3 = %s
                ORDER BY created_at DESC
            """
            self.cursor.execute(query, (level3,))
            stories = self.cursor.fetchall()
            
            if not stories:
                return []
            
            # Convert stories to a more readable format
            formatted_stories = []
            for story in stories:
                story_dict = {
                    'id': story['id'],
                    'latitude': float(story['latitude']),
                    'longitude': float(story['longitude']),
                    'email': story['email'],
                    'good_things': story['good_things'],
                    'underrated_things': story['underrated_things'],
                    'fun_fact': story['fun_fact'],
                    'upvotes': story['upvotes'],
                    'level3': story['level3'],
                    'created_at': story['created_at']
                }
                formatted_stories.append(story_dict)
                
            return formatted_stories
        except Exception as e:
            logging.error(f"Error getting area stories: {str(e)}")
            return []

    def submit_area_story(self, latitude: float, longitude: float, email: str, 
                         good_things: str, underrated_things: str, fun_fact: str, 
                         level3: str) -> bool:
        try:
            query = """
                INSERT INTO area_stories 
                (latitude, longitude, email, good_things, underrated_things, fun_fact, level3)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """
            values = (latitude, longitude, email, good_things, underrated_things, fun_fact, level3)
            self.cursor.execute(query, values)
            self.db.commit()
            return True
        except Exception as e:
            logging.error(f"Error submitting area story: {str(e)}")
            return False 