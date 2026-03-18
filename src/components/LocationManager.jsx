import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, ExternalLink } from 'lucide-react';

const LocationManager = ({ location, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    venue: location?.venue || '',
    address: location?.address || '',
    mapUrl: location?.mapUrl || ''
  });

  const handleSave = () => {
    onUpdate(formData);
    setIsEditing(false);
  };

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setFormData(prev => ({
            ...prev,
            coordinates: { latitude, longitude },
            mapUrl: `https://www.google.com/maps?q=${latitude},${longitude}`
          }));
        },
        (error) => {
          console.error('Geolocation error:', error);
        }
      );
    }
  };

  if (!isEditing && location?.venue) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Location
            </span>
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              Edit
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {location.venue && (
            <div>
              <p className="text-sm font-medium">{location.venue}</p>
            </div>
          )}
          {location.address && (
            <div>
              <p className="text-sm text-muted-foreground">{location.address}</p>
            </div>
          )}
          {location.mapUrl && (
            <Button variant="outline" size="sm" asChild className="w-full">
              <a href={location.mapUrl} target="_blank" rel="noopener noreferrer">
                <MapPin className="h-4 w-4 mr-2" />
                View on Map
                <ExternalLink className="h-4 w-4 ml-2" />
              </a>
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          {location?.venue ? 'Edit Location' : 'Add Location'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="venue">Venue Name</Label>
          <Input
            id="venue"
            placeholder="Conference Room A"
            value={formData.venue}
            onChange={(e) => setFormData(prev => ({ ...prev, venue: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            placeholder="123 Main St, City, State"
            value={formData.address}
            onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="mapUrl">Map URL (optional)</Label>
          <Input
            id="mapUrl"
            placeholder="https://maps.google.com/..."
            value={formData.mapUrl}
            onChange={(e) => setFormData(prev => ({ ...prev, mapUrl: e.target.value }))}
          />
        </div>
        <Button variant="outline" onClick={handleGetCurrentLocation} className="w-full">
          <MapPin className="h-4 w-4 mr-2" />
          Use Current Location
        </Button>
        <div className="flex gap-2">
          <Button onClick={handleSave} className="flex-1">Save</Button>
          <Button variant="outline" onClick={() => setIsEditing(false)} className="flex-1">
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default LocationManager;