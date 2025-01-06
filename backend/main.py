from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict
from services.score_calculator import ScoreCalculator
import logging
from dotenv import load_dotenv
import os
from pydantic import BaseModel, Field, EmailStr
from passlib.context import CryptContext

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

app = FastAPI()
score_calculator = ScoreCalculator()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"], 
)

# Add this class for request validation
class ReportRequest(BaseModel):
    latitude: float
    longitude: float
    reports: Dict[str, int]

class AreaStoryRequest(BaseModel):
    latitude: float
    longitude: float
    email: EmailStr
    good_things: str = Field(..., min_length=10, max_length=1000)
    underrated_things: str = Field(..., min_length=10, max_length=1000)
    fun_fact: str = Field(..., min_length=10, max_length=500)

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class UserSignupRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)

class UserSigninRequest(BaseModel):
    email: EmailStr
    password: str

@app.get("/calculate-score/")
async def calculate_score(latitude: float, longitude: float, UType: str = 'general') -> Dict:
    try:
        logging.info(f"Calculating score for location: ({latitude}, {longitude}) for user type: {UType}")
        location = (latitude, longitude)
        result = score_calculator.calculate_area_score(location, UType)
        logging.info(f"Score calculation result: {result}")
        return result
    except Exception as e:
        logging.error(f"Error calculating score: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/submit-report/")
async def submit_report(report: ReportRequest) -> Dict:
    try:
        # First get admin level info
        location = (report.latitude, report.longitude)
        admin_info = score_calculator.olamaps_service.get_admin_level(location)
        
        # Add level3 to the report submission
        result = score_calculator.db_service.report_service.submit_report(
            latitude=report.latitude,
            longitude=report.longitude,
            reports=report.reports,
            level3=admin_info.get('level3')  # Pass the level3 info
        )
        return {
            "success": result,
            "admin_info": admin_info
        }
    except Exception as e:
        logging.error(f"Error submitting report: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/submit-area-story/")
async def submit_area_story(story: AreaStoryRequest) -> Dict:
    try:
        # Log the incoming request data
        logging.info(f"Received area story submission: {story.dict()}")
        
        # Get admin level info
        location = (story.latitude, story.longitude)
        logging.info(f"Getting admin level info for location: {location}")
        
        admin_info = score_calculator.olamaps_service.get_admin_level(location)
        logging.info(f"Retrieved admin info: {admin_info}")
        
        result = score_calculator.db_service.report_service.submit_area_story(
            latitude=story.latitude,
            longitude=story.longitude,
            email=story.email,
            good_things=story.good_things,
            underrated_things=story.underrated_things,
            fun_fact=story.fun_fact,
            level3=admin_info.get('level3')
        )
        
        logging.info(f"Story submission result: {result}")
        return {
            "success": result,
            "admin_info": admin_info
        }
    except ValidationError as ve:  # Add specific handling for validation errors
        logging.error(f"Validation error in story submission: {str(ve)}")
        raise HTTPException(status_code=422, detail=str(ve))
    except Exception as e:
        logging.error(f"Error submitting area story: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/get-area-stories/")
async def get_area_stories(latitude: float, longitude: float) -> Dict:
    try:
        # Get admin level info
        location = (latitude, longitude)
        admin_info = score_calculator.olamaps_service.get_admin_level(location)
        
        stories = score_calculator.db_service.report_service.get_area_stories(
            admin_info.get('level3')
        )
        return {
            "stories": stories,
            "admin_info": admin_info
        }
    except Exception as e:
        logging.error(f"Error getting area stories: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/upvote-story/{story_id}")
async def upvote_story(story_id: int) -> Dict:
    try:
        result = score_calculator.db_service.report_service.upvote_story(story_id)
        return {"success": result}
    except Exception as e:
        logging.error(f"Error upvoting story: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/get-user-stories/")
async def get_user_stories(email: str) -> Dict:
    try:
        stories = score_calculator.db_service.report_service.get_user_stories(email)
        return {
            "stories": stories,
            "email": email
        }
    except Exception as e:
        logging.error(f"Error getting user stories: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@app.on_event("shutdown")
async def shutdown_event():
    """Clean up database connections on shutdown"""
    if hasattr(score_calculator, 'db_service'):
        score_calculator.db_service.close()

@app.post("/signup/")
async def signup(user: UserSignupRequest) -> Dict:
    try:
        result = score_calculator.db_service.report_service.create_user(
            email=user.email,
            password=user.password
        )
        if not result["success"]:
            raise HTTPException(status_code=400, detail=result["message"])
        return result
    except Exception as e:
        logging.error(f"Error in signup: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/signin/")
async def signin(user: UserSigninRequest) -> Dict:
    try:
        result = score_calculator.db_service.report_service.verify_user(
            email=user.email,
            password=user.password
        )
        if not result["success"]:
            raise HTTPException(
                status_code=401, 
                detail={"message": result["message"]}
            )
        return result
    except HTTPException as he:
        raise he
    except Exception as e:
        logging.error(f"Error in signin: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500, 
            detail={"message": "Internal server error"}
        )

@app.get("/get-location-reports/")
async def get_location_reports(latitude: float, longitude: float) -> Dict:
    try:
        # First get admin level info from OlaMaps
        location = (latitude, longitude)
        admin_info = score_calculator.olamaps_service.get_admin_level(location)
        
        if not admin_info or 'level3' not in admin_info:
            raise HTTPException(
                status_code=400,
                detail={"message": "Could not determine location area"}
            )
            
        # Get reports for this level3 area
        reports = score_calculator.db_service.report_service.get_location_reports(
            admin_info.get('level3')
        )
        
        return {
            "success": True,
            "location": {
                "latitude": latitude,
                "longitude": longitude,
                "level3": admin_info.get('level3'),
                "city": admin_info.get('city'),
                "state": admin_info.get('state')
            },
            "reports": reports,
            "total_reports": len(reports)
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        logging.error(f"Error getting location reports: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail={"message": "Error retrieving location reports"}
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 