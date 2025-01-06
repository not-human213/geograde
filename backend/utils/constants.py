# Weights for different parameters (total should be 100)
PARAMETER_WEIGHTS = {
    'hospitals': 10,
    'schools': 10,
    'public_transport': 10,
    'airports_railways': 5,
    'recreational': 10,
    'commercial': 10,
    'job_hubs': 10,
    'forest_cover': 10,
    'crime_rate': 5,
    'gdp': 5,
    'hdi': 5,
    'amenities': 7,
    'worship' : 5,
    'market' : 10
}

PARAMETER_WEIGHTSSTUDENTS = {
    'hospitals': 10,
    'schools': 15,
    'public_transport': 15,
    'airports_railways': 10,
    'recreational': 15,
    'commercial': 12,
    'job_hubs': 10,
    'forest_cover': 8,
    'crime_rate': 7,
    'gdp': 5,
    'hdi': 5,
    'amenities': 10,
    'worship' : 3,
    'market' : 10
}

# Distance thresholds in meters for general users
DISTANCE_THRESHOLDS = {
    'hospitals': 10000,
    'schools': 5000,
    'public_transport': 3000,
    'airports_railways': 20000,
    'recreational': 2000,
    'commercial': 8000,
    'job_hubs': 10000,
    'amenities' : 3000,
    'worship' : 1500,
    'market' : 3000
}

# for students
DISTANCE_THRESHOLDSSTUDENTS = {
    'hospitals': 5000,
    'schools': 3000,
    'public_transport': 2000,
    'airports_railways': 20000,
    'recreational': 1500,
    'commercial': 5000,
    'job_hubs': 10000,
    'amenities': 2000,
    'worship' : 2000,
    'market' : 3000
}


# Base values for database parameters
DATABASE_BASE_VALUES = {
    'forest_cover': {
        'ideal_percentage': 33,  # National forest policy target is 33%
        'min_percentage': 0
    },
    'crime_rate': {
        'max_crimes_per_lakh': 50000,  # Example threshold
        'min_crimes_per_lakh': 0
    },
    'gdp': {
        'ideal_per_capita': 300,  # Example value in INR
        'min_per_capita': 0
    },
    'hdi': {
        'ideal_score': 1.0,  # HDI ranges from 0 to 1
        'min_score': 0
    }
}

# Ideal number of places for each parameter
IDEAL_COUNTS = {
    'hospitals': 10,
    'schools': 8,
    'public_transport': 15,
    'recreational': 5,
    'commercial': 20,
    'job_hubs': 10
}

# Place types mapping
PLACE_TYPE_MAPPING = {
    'hospitals': ['hospital', 'doctor', 'pharmacy'],
    'schools': ['school', 'university', 'primary_school'],
    'public_transport': ['bus_station', 'subway_station', 'train_station', 'transit_station'],
    'recreational': ['park', 'tourist_attraction'],
    'commercial': ['shopping_mall', 'restaurant', 'movie_theater', 'electronics_store', 'hardware_store'],
    'job_hubs': ['office', 'finance', 'embassy', 'insurance_agency'],
    'amenities': ['beauty_saloon', 'book_store' , 'gas_station', 'gym', 'atm', 'post_office'],
    'worship' : ['place_of_worship', 'hindu_temple', 'church', 'mosque'],
    'market' : ['supermarket', 'home_goods_store', 'bakery']
}

USER_REPORT_WEIGHTS = {
    'good_reports': 10,  # Weight for positive reports in final score
    'bad_reports': 10    # Weight for negative reports in final score
}

# Mapping of report categories to related parameters
REPORT_PARAMETER_MAPPING = {
    'cleanliness': ['environmental_data'],
    'safety': ['crime_rate'],
    'greenery': ['forest_cover', 'recreational'],
    'walkability': ['public_transport'],
    'proximity': ['hospitals', 'schools', 'commercial'],
    'cultural_vibes': ['recreational'],
    'community_events': ['recreational'],
    'lighting': ['safety'],
    'pet_friendly': ['recreational'],
    'public_amenities': ['amenities'],
    'road_conditions': ['public_transport'],
    'innovative_infrastructure': ['public_transport'],
    'scenic_views': ['recreational'],
    'public_transportation': ['public_transport'],
    'business_activity': ['commercial', 'job_hubs']
}