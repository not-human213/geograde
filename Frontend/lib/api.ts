const API_BASE_URL = "http://127.0.0.1:8000"; // Centralized API Base URL

/**
 * Centralized fetch utility to handle API requests with error handling
 */
const apiFetch = async (endpoint: string, options: RequestInit): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

    const responseData = await response.json();
    if (!response.ok) {
      const errorMessage = responseData.detail || responseData.message || "An error occurred";
      throw new Error(errorMessage);
    }

    return responseData;
  } catch (error) {
    console.error(`Error in API call to ${endpoint}:`, error);
    throw error instanceof Error ? error : new Error("Unknown error occurred");
  }
};

/**
 * Auth Data Interfaces
 */
interface AuthData {
  email: string;
  password: string;
}

interface AuthResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: {
    email: string;
    id: string;
  };
}

/**
 * Function to Sign In
 */
export const signIn = async (data: AuthData): Promise<AuthResponse> => {
  return await apiFetch("/signin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
};

/**
 * Function to Sign Up
 */
export const signUp = async (data: AuthData): Promise<AuthResponse> => {
  return await apiFetch("/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
};

/**
 * Parameter Scores Interfaces
 */
interface ParameterScores {
  hospitals: number;
  schools: number;
  public_transport: number;
  recreational: number;
  commercial: number;
  job_hubs: number;
  amenities: number;
  worship: number;
  market: number;
  forest_cover: number;
  crime_rate: number;
  gdp: number;
  hdi: number;
  user_reports: number;
}

interface ScoreResponse {
  total_score: number;
  parameter_scores: ParameterScores;
}

/**
 * Function to Calculate Score
 */
export const calculateScore = async (latitude: number, longitude: number, userType: string): Promise<ScoreResponse> => {
  return await apiFetch(`/calculate-score/?latitude=${latitude}&longitude=${longitude}&UType=${userType}`, {
    method: "GET",
  });
};

/**
 * Location Report Interfaces
 */
interface LocationReport {
  latitude: number;
  longitude: number;
  level3: string;
  created_at: string | null;
  ratings: {
    cleanliness: number;
    safety: number;
    greenery: number;
    [key: string]: number;
  };
}

interface LocationReportsResponse {
  success: boolean;
  location: {
    latitude: number;
    longitude: number;
    level3: string;
    city: string;
    state: string;
  };
  reports: LocationReport[];
}

/**
 * Function to Get Location Reports
 */
export const getLocationReports = async (latitude: number, longitude: number): Promise<LocationReportsResponse> => {
  return await apiFetch(`/get-location-reports/?latitude=${latitude}&longitude=${longitude}`, {
    method: "GET",
  });
};

/**
 * Story Interfaces
 */
interface Story {
  id: number;
  latitude: number;
  longitude: number;
  email: string;
  good_things: string;
  underrated_things: string;
  fun_fact: string;
  upvotes: number;
  level3: string;
  created_at: string;
}

interface AreaStoriesResponse {
  stories: Story[];
  admin_info: {
    city: string;
    state: string;
    level3: string;
  };
}

/**
 * Function to Get Area Stories
 */
export const getAreaStories = async (latitude: number, longitude: number): Promise<AreaStoriesResponse> => {
  return await apiFetch(`/get-area-stories/?latitude=${latitude}&longitude=${longitude}`, {
    method: "GET",
  });
};

/**
 * Function to Upvote a Story
 */
export const upvoteStory = async (storyId: number): Promise<void> => {
  await apiFetch(`/upvote-story/${storyId}`, { method: "POST" });
};

/**
 * Submit Story Interfaces
 */
interface SubmitStoryData {
  latitude: number;
  longitude: number;
  email: string;
  good_things: string;
  underrated_things: string;
  fun_fact: string;
  [key: string]: number | string; // Allow for dynamic parameters
}

/**
 * Function to Submit an Area Story
 */
export const submitAreaStory = async (data: SubmitStoryData): Promise<any> => {
  return await apiFetch("/submit-area-story/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
};

/**
 * Submit Report Interfaces
 */
interface ReportData {
  latitude: number;
  longitude: number;
  reports: {
    [key: string]: number;
  };
}

/**
 * Function to Submit a Report
 */
export const submitReport = async (data: ReportData): Promise<void> => {
  await apiFetch("/submit-report/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
};
