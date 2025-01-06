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

interface SubmitStoryData {
  latitude: number;
  longitude: number;
  email: string;
  good_things: string;
  underrated_things: string;
  fun_fact: string;
  [key: string]: number | string; // Allow for dynamic parameters
}

interface ReportData {
  latitude: number;
  longitude: number;
  reports: {
    [key: string]: number;
  };
}

export const signIn = async (data: AuthData): Promise<AuthResponse> => {
  try {
    const response = await fetch("http://100.84.197.86:8000/signin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const responseData = await response.json();
    console.log("Sign in response:", responseData);

    // Return the response data even if it's not successful
    // so we can show the proper error message
    return responseData;
  } catch (error) {
    console.error("Sign in error:", error);
    throw new Error("Failed to connect to the server");
  }
};

export const signUp = async (data: AuthData): Promise<AuthResponse> => {
  try {
    const response = await fetch("http://100.84.197.86:8000/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const responseData = await response.json();
    console.log("Sign up response:", responseData);

    // Return the response data even if it's not successful
    // so we can show the proper error message
    return responseData;
  } catch (error) {
    console.error("Sign up error:", error);
    throw new Error("Failed to connect to the server");
  }
};

export const calculateScore = async (latitude: number, longitude: number, userType: string): Promise<ScoreResponse> => {
  try {
    const response = await fetch(`http://100.84.197.86:8000/calculate-score/?latitude=${latitude}&longitude=${longitude}&UType=${userType}`);
    return await response.json();
  } catch (error) {
    console.error("Error calculating score:", error);
    throw error;
  }
};

export const getLocationReports = async (latitude: number, longitude: number): Promise<LocationReportsResponse> => {
  try {
    const response = await fetch(`http://100.84.197.86:8000/get-location-reports/?latitude=${latitude}&longitude=${longitude}`);
    return await response.json();
  } catch (error) {
    console.error("Error getting location reports:", error);
    throw error;
  }
};

export const getAreaStories = async (latitude: number, longitude: number): Promise<AreaStoriesResponse> => {
  try {
    const response = await fetch(`http://100.84.197.86:8000/get-area-stories/?latitude=${latitude}&longitude=${longitude}`);
    return await response.json();
  } catch (error) {
    console.error("Error getting area stories:", error);
    throw error;
  }
};

export const upvoteStory = async (storyId: number): Promise<void> => {
  try {
    await fetch(`http://100.84.197.86:8000/upvote-story/${storyId}`, {
      method: "POST",
    });
  } catch (error) {
    console.error("Error upvoting story:", error);
    throw error;
  }
};

export const submitAreaStory = async (data: SubmitStoryData): Promise<any> => {
  try {
    // Log the incoming data
    console.log("Story data received by API:", JSON.stringify(data, null, 2));

    // Validate data structure
    if (!data.latitude || !data.longitude || !data.email) {
      throw new Error("Missing required fields: latitude, longitude, or email");
    }

    const response = await fetch("http://100.84.197.86:8000/submit-area-story/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    // Log the raw response
    console.log("Raw response status:", response.status);
    console.log("Raw response status text:", response.statusText);

    const responseData = await response.json();
    console.log("Server response data:", JSON.stringify(responseData, null, 2));

    if (!response.ok) {
      const errorMessage = responseData.detail || responseData.message || response.statusText || "Failed to submit story";
      console.error("Error response:", errorMessage);
      throw new Error(errorMessage);
    }

    return responseData;
  } catch (error) {
    console.error("Error in submitAreaStory:", error);
    throw error;
  }
};

export const submitReport = async (data: ReportData): Promise<void> => {
  try {
    const response = await fetch("http://100.84.197.86:8000/submit-report/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const responseData = await response.json();
    console.log("Report submission response:", responseData);

    if (!response.ok) {
      throw new Error(responseData.detail || responseData.message || "Failed to submit report");
    }

    return responseData;
  } catch (error) {
    console.error("Error submitting report:", error);
    if (error instanceof Error) {
      throw new Error(`Failed to submit report: ${error.message}`);
    }
    throw new Error("Failed to submit report");
  }
};
