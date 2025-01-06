import { useState } from "react";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThumbsUp } from "lucide-react";
import { upvoteStory } from "@/lib/api";

interface Story {
  id: number;
  email: string;
  good_things: string;
  underrated_things: string;
  fun_fact: string;
  upvotes: number;
  created_at: string;
}

interface AreaStoriesProps {
  stories: Story[];
}

export function AreaStories({ stories }: AreaStoriesProps) {
  const [localStories, setLocalStories] = useState(stories);

  const handleUpvote = async (storyId: number) => {
    try {
      await upvoteStory(storyId);
      setLocalStories((prevStories) => prevStories.map((story) => (story.id === storyId ? { ...story, upvotes: story.upvotes + 1 } : story)));
    } catch (error) {
      console.error("Failed to upvote story:", error);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">Area Stories</h3>
      {localStories.map((story) => (
        <Card key={story.id}>
          <CardHeader>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">{new Date(story.created_at).toLocaleDateString()}</span>
              <span className="text-sm text-gray-600">{story.email}</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <h4 className="font-semibold">Good Things</h4>
              <p className="text-gray-700">{story.good_things}</p>
            </div>
            <div>
              <h4 className="font-semibold">Hidden Gems</h4>
              <p className="text-gray-700">{story.underrated_things}</p>
            </div>
            <div>
              <h4 className="font-semibold">Fun Fact</h4>
              <p className="text-gray-700">{story.fun_fact}</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" size="sm" onClick={() => handleUpvote(story.id)} className="ml-auto">
              <ThumbsUp className="h-4 w-4 mr-2" />
              {story.upvotes}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
