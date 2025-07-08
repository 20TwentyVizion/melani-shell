
import * as React from 'react';
import { Calendar as CalendarIcon, Plus, Clock } from 'lucide-react';
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const CalendarApp = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [events, setEvents] = useState([
    { id: 1, title: 'Meeting with team', time: '10:00 AM', date: new Date().toDateString() },
    { id: 2, title: 'Project deadline', time: '2:00 PM', date: new Date().toDateString() },
  ]);

  return (
    <div className="w-full h-full p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
        <Card className="glass-effect border-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" />
              Calendar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md"
            />
          </CardContent>
        </Card>

        <Card className="glass-effect border-none">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Today's Events
              </span>
              <Button size="sm" className="glass-effect">
                <Plus className="w-4 h-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {events.map((event) => (
                <div key={event.id} className="p-3 rounded-lg glass-effect">
                  <h4 className="font-medium">{event.title}</h4>
                  <p className="text-sm opacity-70">{event.time}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CalendarApp;
