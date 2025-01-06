from  typing import Dict, List, Tuple, Set
from utils.constants import PARAMETER_WEIGHTS, DISTANCE_THRESHOLDS, PLACE_TYPE_MAPPING, IDEAL_COUNTS, DATABASE_BASE_VALUES, DISTANCE_THRESHOLDSSTUDENTS, PARAMETER_WEIGHTSSTUDENTS, USER_REPORT_WEIGHTS
from services.olamaps_service import OlaMapsService
from services.database_service import DatabaseService
import logging

class ScoreCalculator:
    def __init__(self):
        self.olamaps_service = OlaMapsService()
        self.db_service = DatabaseService()

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

    def get_places_score(self, location: Tuple[float, float], place_types: List[str], 
                        threshold: float, utype: str = 'general') -> float:
        """Calculate score for a group of place types"""
        scores = []
        all_places = []
        
        # Get parameter name from place_types by matching with PLACE_TYPE_MAPPING
        parameter_name = next(
            (param for param, types in PLACE_TYPE_MAPPING.items() 
             if sorted(types) == sorted(place_types)), 
            None
        )
        
        # Get ideal count for this parameter
        ideal_count = IDEAL_COUNTS.get(parameter_name, 15)  # Default to 15 if not found
        
        # Get the specific radius based on user type
        thresholds = DISTANCE_THRESHOLDS if utype.lower() == 'general' else DISTANCE_THRESHOLDSSTUDENTS
        search_radius = thresholds.get(parameter_name, 3000)  # Default to 3000m if not found
        
        # First collect all places for all types
        for place_type in place_types:
            places = self.olamaps_service.get_nearby_places(
                location=location, 
                place_type=place_type, 
                radius=search_radius
            )
            all_places.extend(places)
        
        # Remove duplicates
        unique_places = self.get_unique_places(all_places)
        logging.info(f"Found {len(all_places)} total places, {len(unique_places)} unique places")
        
        if not unique_places:
            logging.warning(f"No places found for types {place_types}")
            return 0
            
        # Calculate quantity score based on unique places and parameter-specific ideal count
        quantity_score = self.calculate_quantity_score(len(unique_places), ideal_count)
        
        # Calculate proximity score
        distances = []
        for place in unique_places:
            try:
                distance = float(place.get('distance_meters', float('inf')))
                distances.append(distance)
            except (ValueError, TypeError) as e:
                logging.error(f"Error processing distance for place: {place}")
                continue
        
        if not distances:
            logging.warning(f"No valid distances found for types {place_types}")
            return 0
            
        # Get average of top 3 nearest places for proximity score
        distances.sort()
        top_distances = distances[:3]
        avg_distance = sum(top_distances) / len(top_distances)
        proximity_score = self.calculate_proximity_score(avg_distance, threshold)
        
        # Combine proximity and quantity scores (60-40 split)
        combined_score = (proximity_score * 0.6) + (quantity_score * 0.4)
        
        logging.info(f"""
            Scores for types {place_types}:
            - Proximity Score: {proximity_score:.2f} (avg distance: {avg_distance:.0f}m)
            - Quantity Score: {quantity_score:.2f} ({len(unique_places)} unique places)
            - Combined Score: {combined_score:.2f}
        """)
        
        return combined_score

    def calculate_area_score(self, location: Tuple[float, float], utype: str = 'general') -> Dict:
        """Calculate overall area score"""
        parameter_scores = {}
        
        # Get database data and reports
        admin_level = self.olamaps_service.get_admin_level(location)
        db_data = self.db_service.get_area_data(admin_level)  # Get this first
        reports = self.db_service.report_service.get_nearby_reports(admin_level['level3'])
        report_score = self.db_service.report_service.calculate_report_score(reports)
        
        # Select the appropriate thresholds and weights based on user type
        thresholds = DISTANCE_THRESHOLDS if utype.lower() == 'general' else DISTANCE_THRESHOLDSSTUDENTS
        weights = PARAMETER_WEIGHTS if utype.lower() == 'general' else PARAMETER_WEIGHTSSTUDENTS
        
        # Add report weights
        weights = {**weights, 'user_reports': USER_REPORT_WEIGHTS['good_reports'] + USER_REPORT_WEIGHTS['bad_reports']}
        
        # Calculate scores for each parameter from OlaMaps
        for parameter, place_types in PLACE_TYPE_MAPPING.items():
            threshold = thresholds[parameter]
            score = self.get_places_score(location, place_types, threshold, utype)
            parameter_scores[parameter] = round(score, 2)
        
        # Add database-derived scores
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