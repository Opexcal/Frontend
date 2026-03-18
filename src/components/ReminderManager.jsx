import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, Plus, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const ReminderManager = ({ reminders = [], onAdd, onRemove, type = 'event' }) => {
  const [selectedTime, setSelectedTime] = useState('30');
  const [selectedType, setSelectedType] = useState('notification');

  const handleAdd = () => {
    onAdd({
      type: selectedType,
      minutesBefore: parseInt(selectedTime)
    });
  };

  const timeOptions = [
    { value: '5', label: '5 minutes before' },
    { value: '15', label: '15 minutes before' },
    { value: '30', label: '30 minutes before' },
    { value: '60', label: '1 hour before' },
    { value: '1440', label: '1 day before' },
    { value: '10080', label: '1 week before' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Reminders
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Existing reminders */}
        <div className="space-y-2">
          {reminders.map((reminder, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-accent/50 rounded-lg">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-primary" />
                <span className="text-sm">
                  {reminder.minutesBefore} minutes before
                </span>
                <Badge variant="outline" className="text-xs">
                  {reminder.type}
                </Badge>
                {reminder.sent && (
                  <Badge variant="secondary" className="text-xs">
                    Sent
                  </Badge>
                )}
              </div>
              {!reminder.sent && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onRemove(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          {reminders.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No reminders set
            </p>
          )}
        </div>

        {/* Add new reminder */}
        <div className="space-y-3 pt-3 border-t">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-sm mb-1 block">Timing</Label>
              <Select value={selectedTime} onValueChange={setSelectedTime}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timeOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm mb-1 block">Type</Label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="notification">Notification only</SelectItem>
                  <SelectItem value="email">Email only</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={handleAdd} className="w-full" variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add Reminder
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReminderManager;