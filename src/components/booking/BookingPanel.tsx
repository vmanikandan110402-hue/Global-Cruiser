import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { CalendarIcon, Clock, Users, Minus, Plus, Check } from 'lucide-react';

const BASE_TIME_SLOTS = [
  { label: '6:00 AM', value: '06:00' },
  { label: '9:00 AM', value: '09:00' },
  { label: '12:00 PM', value: '12:00' },
  { label: '3:00 PM', value: '15:00' },
  { label: '7:00 PM', value: '19:00' },
  { label: '10:00 PM', value: '22:00' },
];

interface BookingPanelProps {
  isOpen: boolean;
  onClose: () => void;
  yacht: any;
  offer: any;
}

const BookingPanel = ({ isOpen, onClose, yacht, offer }: BookingPanelProps) => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [hours, setHours] = useState(3);
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const HOUR_OPTIONS = [2, 3, 4, 5, 6, 7, 8, 9, 10];

  const formatTime = (hour: number) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:00 ${period}`;
  };

  useEffect(() => {
    if (date && yacht?.id) {
      fetchBookedSlots();
    }
    // Reset selected slot when hours change
    setSelectedSlot(null);
  }, [date, yacht?.id, hours]);

  const fetchBookedSlots = async () => {
    if (!date) return;
    
    const { data, error } = await supabase
      .from('bookings')
      .select('start_time, hours')
      .eq('yacht_id', yacht.id)
      .eq('booking_date', format(date, 'yyyy-MM-dd'))
      .in('status', ['pending', 'confirmed']);

    if (!error && data) {
      // Store all booked time slots with their durations
      const blocked: { start: string; hours: number }[] = [];
      data.forEach((booking) => {
        blocked.push({
          start: booking.start_time,
          hours: booking.hours || 2
        });
      });
      setBookedSlots(blocked);
    }
  };

  const getBlockedSlotsForSelection = () => {
    if (!date || !yacht?.id || !hours) return [];
    
    const blocked: string[] = [];
    
    // Check each base slot to see if it can accommodate the selected duration
    BASE_TIME_SLOTS.forEach((slot) => {
      const slotStart = parseInt(slot.value.split(':')[0]);
      const slotEnd = slotStart + hours;
      
      // Check if this slot would conflict with existing bookings
      const hasConflict = bookedSlots.some((booking) => {
        const bookingStart = parseInt(booking.start.split(':')[0]);
        const bookingEnd = bookingStart + (booking.hours || 2);
        
        // Check if there's any overlap
        return !(slotEnd <= bookingStart || slotStart >= bookingEnd);
      });
      
      if (hasConflict) {
        blocked.push(slot.value);
      }
    });
    
    return blocked;
  };

  const hourlyPrice = Number(yacht?.hourly_price || 0);
  const discountPercent = offer?.discount_percentage || 0;
  const subtotal = hourlyPrice * hours;
  const discount = (subtotal * discountPercent) / 100;
  const total = subtotal - discount;

  const handleBooking = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to book');
      navigate('/auth');
      return;
    }

    if (!date || !selectedSlot) {
      toast.error('Please select date and time slot');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.from('bookings').insert({
        user_id: user?.id,
        yacht_id: yacht.id,
        booking_date: format(date, 'yyyy-MM-dd'),
        start_time: selectedSlot,
        hours,
        total_price: total,
        offer_id: offer?.id || null,
        guest_name: guestName || user?.first_name || '',
        guest_email: guestEmail || user?.email || '',
        guest_phone: guestPhone,
        status: 'pending',
      });

      if (error) throw error;

      toast.success('Booking submitted successfully!');
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Booking failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto bg-card border-border">
        <SheetHeader>
          <SheetTitle className="text-2xl">Book {yacht?.name}</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Date Selection */}
          <div>
            <Label className="flex items-center gap-2 mb-3">
              <CalendarIcon className="w-4 h-4 text-primary" />
              Select Date
            </Label>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              disabled={(date) => date < new Date()}
              className="rounded-lg border border-border"
            />
          </div>

          {/* Hours Selection */}
          {date && (
            <div>
              <Label className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-primary" />
                Select Duration
              </Label>
              <Select value={hours.toString()} onValueChange={(value) => setHours(parseInt(value))}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  {HOUR_OPTIONS.map((hourOption) => (
                    <SelectItem key={hourOption} value={hourOption.toString()}>
                      {hourOption} {hourOption === 1 ? 'hour' : 'hours'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground mt-2">Choose your booking duration</p>
            </div>
          )}

          {/* Time Slots */}
          {date && hours && (
            <div>
              <Label className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-primary" />
                Available Time Slots for {hours} {hours === 1 ? 'hour' : 'hours'}
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {BASE_TIME_SLOTS.map((slot) => {
                  const blockedSlots = getBlockedSlotsForSelection();
                  const isBooked = blockedSlots.includes(slot.value);
                  const isSelected = selectedSlot === slot.value;
                  const slotStart = parseInt(slot.value.split(':')[0]);
                  const slotEnd = slotStart + hours;
                  const endTime = formatTime(slotEnd);
                  
                  return (
                    <button
                      key={slot.value}
                      onClick={() => !isBooked && setSelectedSlot(slot.value)}
                      disabled={isBooked}
                      className={`p-3 rounded-lg text-sm font-medium transition-all ${
                        isBooked
                          ? 'bg-muted text-muted-foreground cursor-not-allowed line-through'
                          : isSelected
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary hover:bg-secondary/80'
                      }`}
                    >
                      <div className="text-center">
                        <div>{slot.label}</div>
                        <div className="text-xs opacity-75">
                          to {endTime}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
              {getBlockedSlotsForSelection().length === BASE_TIME_SLOTS.length && (
                <p className="text-sm text-amber-600 mt-2">
                  No available slots for {hours} hours on this date. Try a different duration or date.
                </p>
              )}
            </div>
          )}

          {/* Guest Details */}
          {!isAuthenticated && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="guest-name">Full Name</Label>
                <Input
                  id="guest-name"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Your full name"
                />
              </div>
              <div>
                <Label htmlFor="guest-email">Email</Label>
                <Input
                  id="guest-email"
                  type="email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <Label htmlFor="guest-phone">Phone</Label>
                <Input
                  id="guest-phone"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  placeholder="+971 50 123 4567"
                />
              </div>
            </div>
          )}

          {/* Price Summary */}
          {selectedSlot && (
            <div className="p-4 rounded-xl bg-secondary/50 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  AED {hourlyPrice.toLocaleString()} × {hours} hours
                </span>
                <span>AED {subtotal.toLocaleString()}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm text-green-500">
                  <span>Discount ({discountPercent}%)</span>
                  <span>-AED {discount.toLocaleString()}</span>
                </div>
              )}
              <div className="border-t border-border pt-3 flex justify-between font-semibold">
                <span>Total</span>
                <span className="text-primary text-xl">AED {total.toLocaleString()}</span>
              </div>
            </div>
          )}

          {/* Book Button */}
          <Button
            variant="default"
            size="xl"
            className="w-full"
            onClick={handleBooking}
            disabled={!date || !selectedSlot || isLoading}
          >
            {isLoading ? 'Processing...' : isAuthenticated ? 'Confirm Booking' : 'Sign In to Book'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default BookingPanel;
