import requests
from typing import Dict, List, Tuple
import logging
from utils.constants import DISTANCE_THRESHOLDS, DISTANCE_THRESHOLDSSTUDENTS
import os

class OlaMapsService:
    def __init__(self):
        self.api_key = os.getenv('OLAMAPS_API_KEY')
        if not self.api_key:
            raise Exception("OLAMAPS_API_KEY environment variable not set")
        self.base_url = "https://api.olamaps.io/"

    def get_nearby_places(self, location: Tuple[float, float], place_type: str, radius: int) -> List[Dict]:
        url = f"{self.base_url}/places/v1/nearbysearch"
        params = {
            'types': place_type,
            'location': f"{location[0]}, {location[1]}",
            'rankBy': 'distance',
            'radius': radius,  # Use the radius passed from score_calculator
            'api_key': self.api_key
        }
        
        try:
            response = requests.get(url, params=params)
            response.raise_for_status()                                                      
            data = response.json()
            logging.info(f"Searching for {place_type} within {radius}m radius")
            return data.get('predictions', [])
        except Exception as e:
            logging.error(f"Error fetching {place_type} within {radius}m: {str(e)}")
            return []
        
    def get_admin_level(self, location: Tuple[float, float]) -> str:
        url = f"{self.base_url}/places/v1/reverse-geocode"
        
        params = {
            'latlng': f"{location[0]}, {location[1]}",
            'api_key': self.api_key
        }

        response = requests.get(url, params=params)
        data = response.json()
        print(data.keys())
        address = data['results'][0]['address_components'] 

        city = None
        state = None
        for add in address:
            if add['types'][0] == 'administrative_area_level_2':
                city = add['short_name']
            if add['types'][0] == 'administrative_area_level_1':
                state = add['short_name']
            if add['types'][0] == 'administrative_area_level_3':
                level3 = add['short_name']


        return {'city':city,'state':state, 'level3':level3}