import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { useSystemMemory } from "@/lib/systemMemory";
import { useToast } from "@/components/ui/use-toast";

interface ProfileData {
  name: string;
  photoUrl: string;
  interests: string[];
}

const Profile = () => {
  const [profile, setProfile] = useState<ProfileData>(() => {
    const saved = localStorage.getItem('melani-profile');
    return saved ? JSON.parse(saved) : {
      name: '',
      photoUrl: '',
      interests: []
    };
  });
  const [newInterest, setNewInterest] = useState('');
  const { toast } = useToast();
  const { addProcess, removeProcess } = useSystemMemory();

  useEffect(() => {
    addProcess("Profile Manager", 128);
    return () => removeProcess("Profile Manager");
  }, []);

  useEffect(() => {
    localStorage.setItem('melani-profile', JSON.stringify(profile));
  }, [profile]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile(prev => ({ ...prev, photoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const addInterest = () => {
    if (newInterest.trim() && !profile.interests.includes(newInterest.trim())) {
      setProfile(prev => ({
        ...prev,
        interests: [...prev.interests, newInterest.trim()]
      }));
      setNewInterest('');
      toast({
        title: "Interest added",
        description: `${newInterest} has been added to your interests.`
      });
    }
  };

  const removeInterest = (interest: string) => {
    setProfile(prev => ({
      ...prev,
      interests: prev.interests.filter(i => i !== interest)
    }));
  };

  return (
    <Card className="w-[400px] glass-effect">
      <CardHeader>
        <CardTitle>Your Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col items-center space-y-4">
          <Avatar className="w-24 h-24">
            <AvatarImage src={profile.photoUrl} />
            <AvatarFallback>
              {profile.name ? profile.name[0].toUpperCase() : '?'}
            </AvatarFallback>
          </Avatar>
          <Input
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Name</label>
          <Input
            value={profile.name}
            onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Enter your name"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Interests</label>
          <div className="flex space-x-2">
            <Input
              value={newInterest}
              onChange={(e) => setNewInterest(e.target.value)}
              placeholder="Add an interest"
              onKeyPress={(e) => e.key === 'Enter' && addInterest()}
            />
            <Button onClick={addInterest}>Add</Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {profile.interests.map((interest, index) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                {interest}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => removeInterest(interest)}
                />
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Profile;