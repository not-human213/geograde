
from  typing import Dict, List, Tuple, Set
from utils.constants import PARAMETER_WEIGHTS, DISTANCE_THRESHOLDS, PLACE_TYPE_MAPPING, IDEAL_COUNTS, DATABASE_BASE_VALUES, DISTANCE_THRESHOLDSSTUDENTS, PARAMETER_WEIGHTSSTUDENTS, USER_REPORT_WEIGHTS
from services.olamaps_service import OlaMapsService
from services.database_service import DatabaseService
import logging
from concurrent.futures import ThreadPoolExecutor

class ScoreCalculator:
    def __init__(self):
        self.olamaps_service = OlaMapsService()
        self.db_service = DatabaseService()

    # Existing methods (calculate_proximity_score, calculate_quantity_score, etc.) remain unchanged

    def calculate_proximity_score(self, distance: float, max_distance: float) -> float:
            """Calculate score based on proximity"""
            if distance > max_distance:
                return 0
            return (1 - (distance / max_distance)) * 100

    def calculate_quantity_score(self, count: int, ideal_count: int) -> float:
        """Calculate score based on number of places"""
        if count == 0:
            return 0
        return min((count / ideal_count) * 100, 100)

    def get_unique_places(self, places_list: List[Dict]) -> List[Dict]:
        """Remove duplicate places based on place_id"""
        seen_places = set()
        unique_places = []
        
        for place in places_list:
            place_id = place.get('place_id')
            if place_id and place_id not in seen_places:
                seen_places.add(place_id)
                unique_places.append(place)
        
        return unique_places

    def get_places_score_threaded(self, location: Tuple[float, float], place_types: List[str], threshold: float, utype: str = 'general') -> float:
        """Calculate score for a group of place types using threads."""
        def fetch_places(place_type: str) -> List[Dict]:
            """Fetch places for a specific place_type."""
            return self.olamaps_service.get_nearby_places(location=location, place_type=place_type, radius=threshold)

        all_places = []
        with ThreadPoolExecutor(max_workers=len(place_types)) as executor:
            # Create a thread for each place_type
            place_futures = {place_type: executor.submit(fetch_places, place_type) for place_type in place_types}

            # Collect results from all threads
            for place_type, future in place_futures.items():
                try:
                    places = future.result()
                    all_places.extend(places)
                except Exception as e:
                    logging.error(f"Error fetching places for {place_type}: {e}")

        # Remove duplicates and calculate scores
        unique_places = self.get_unique_places(all_places)
        if not unique_places:
            logging.warning(f"No places found for types {place_types}")
            return 0

        # Calculate quantity and proximity scores
        ideal_count = IDEAL_COUNTS.get(place_types[0], 15)  # Default to 15 if not found
        quantity_score = self.calculate_quantity_score(len(unique_places), ideal_count)

        distances = [float(place.get('distance_meters', float('inf'))) for place in unique_places if 'distance_meters' in place]
        if not distances:
            logging.warning(f"No valid distances found for types {place_types}")
            return 0

        # Get the average of top 3 nearest places
        distances.sort()
        top_distances = distances[:3]
        avg_distance = sum(top_distances) / len(top_distances)
        proximity_score = self.calculate_proximity_score(avg_distance, threshold)

        # Combine proximity and quantity scores
        combined_score = (proximity_score * 0.6) + (quantity_score * 0.4)
        return combined_score
    
    
    def calculate_area_score(self, location: Tuple[float, float], utype: str = 'general') -> Dict:
        """Calculate overall area score with multithreading"""
        parameter_scores = {}
        thresholds = DISTANCE_THRESHOLDS if utype.lower() == 'general' else DISTANCE_THRESHOLDSSTUDENTS
        weights = PARAMETER_WEIGHTS if utype.lower() == 'general' else PARAMETER_WEIGHTSSTUDENTS

        # Add report weights
        weights = {**weights, 'user_reports': USER_REPORT_WEIGHTS['good_reports'] + USER_REPORT_WEIGHTS['bad_reports']}

        def fetch_db_data():
            """Fetch database data"""
            admin_level = self.olamaps_service.get_admin_level(location)
            return self.db_service.get_area_data(admin_level)
        
        

        def calculate_parameter_scores():
            """Calculate parameter scores"""
            scores = {}
            for parameter, place_types in PLACE_TYPE_MAPPING.items():
                threshold = thresholds[parameter]
                score = self.get_places_score_threaded(location, place_types, threshold, utype)
                scores[parameter] = round(score, 2)
            return scores

        # Create threads for db_data and parameter_scores
        with ThreadPoolExecutor(max_workers=2) as executor:
            db_data_future = executor.submit(fetch_db_data)
            parameter_scores_future = executor.submit(calculate_parameter_scores)

            # Fetch results
            db_data = db_data_future.result()
            parameter_scores = parameter_scores_future.result()

        # Fetch and calculate report data
        admin_level = self.olamaps_service.get_admin_level(location)
        reports = self.db_service.report_service.get_nearby_reports(admin_level['level3'])
        report_score = self.db_service.report_service.calculate_report_score(reports)

        # Add database-derived scores to parameter_scores
        if db_data:
            parameter_scores['forest_cover'] = round(db_data['environmental_data']['score'], 2)
            parameter_scores['crime_rate'] = round(db_data['crime_data']['score'], 2)
            parameter_scores['gdp'] = round(db_data['economic_data']['score'], 2)
            parameter_scores['hdi'] = round(db_data['hdi_data']['score'], 2)

        # Add user report score
        parameter_scores['user_reports'] = round(report_score, 2)

        # Calculate weighted average ensuring total is under 100
        final_score = 0
        total_weight = sum(weights.values())
        for parameter, score in parameter_scores.items():
            normalized_weight = weights[parameter] / total_weight
            final_score += (score * normalized_weight)

        # Return the final result
        return {
            'total_score': round(final_score, 2),
            'parameter_scores': parameter_scores,
            'weights_used': weights,
            'user_type': utype,
            'details': {
                'thresholds': thresholds,
                'place_types': PLACE_TYPE_MAPPING,
                'database_base_values': DATABASE_BASE_VALUES,
                'user_reports': reports
            },
            'area_data': db_data
        }
