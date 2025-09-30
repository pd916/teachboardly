'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Calendar, 
  CreditCard, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Crown,
  X,
  Loader2
} from 'lucide-react';

import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

// Define types based on your Prisma schema
type SubscriptionStatus = 'TRIALING' | 'ACTIVE' | 'CANCELED' | 'EXPIRED';

interface Subscription {
  id: string;
  userId: string;
  paddleSubscriptionId?: string | null;
  status: SubscriptionStatus;
  trialEndsAt: Date;
  currentPeriodStart?: Date | null;
  currentPeriodEnd?: Date | null;
  cancelAtPeriodEnd: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface PlanUsageProps {
  subscription?: Subscription | null;
  onCancelSubscription?: () => Promise<{ success: boolean; error?: string; message?: string }>;
  onReactivateSubscription?: () => Promise<{ success: boolean; error?: string; message?: string }>;
}

const PlanUsage: React.FC<PlanUsageProps> = ({ subscription, onCancelSubscription, onReactivateSubscription }) => {
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [isLoading, setIsLoading] = useState(false);
   const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // Update time every minute for real-time countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  const handleCancelSubscription = () => {
    if (!onCancelSubscription) return;
    
    // Confirmation dialog
    const confirmed = window.confirm(
      "Are you sure you want to cancel your subscription?\n\n" +
      "• You'll keep access until the end of your current billing period\n" +
      "• You can reactivate anytime before it ends\n" +
      "• No refunds for the current period"
    );

    if (!confirmed) return;

    startTransition(async () => {
      try {
        const result = await onCancelSubscription();
        
        if (result.success) {
          toast.success(result.message || "Subscription scheduled for cancellation");
          router.refresh();
        } else {
          toast.error(result.error || "Failed to cancel subscription");
        }
      } catch (error) {
        console.error('Cancel subscription error:', error);
        toast.error("An unexpected error occurred");
      }
    });
  };

  const handleReactivateSubscription = () => {
    if (!onReactivateSubscription) return;

    startTransition(async () => {
      try {
        const result = await onReactivateSubscription();
        
        if (result.success) {
          toast.success(result.message || "Subscription reactivated successfully!");
          router.refresh();
        } else {
          toast.error(result.error || "Failed to reactivate subscription");
        }
      } catch (error) {
        console.error('Reactivate subscription error:', error);
        toast.error("An unexpected error occurred");
      }
    });
  };

  // Calculate subscription details based on your schema
  const getSubscriptionDetails = () => {
    if (!subscription) {
      return {
        planType: 'Free',
        status: 'FREE' as const,
        percentage: 0,
        timeLeft: 'Unlimited',
        endDate: null,
        isExpired: false,
        daysLeft: 0,
        hoursLeft: 0,
        minutesLeft: 0,
        exactEndTime: null
      };
    }

    const now = currentTime;

    if (subscription.status === 'TRIALING') {
      const start = new Date(subscription.createdAt).getTime();
      const end = new Date(subscription.trialEndsAt).getTime();
      
      const total = end - start;
      const elapsed = now - start;
      const percentage = Math.min(Math.max((elapsed / total) * 100, 0), 100);
      
      const timeRemaining = Math.max(end - now, 0);
      const daysLeft = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
      const hoursLeft = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutesLeft = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));

      return {
        planType: 'Trial',
        status: 'TRIAL' as const,
        percentage,
        timeLeft: timeRemaining > 0 ? `${daysLeft}d ${hoursLeft}h ${minutesLeft}m` : 'Expired',
        endDate: new Date(subscription.trialEndsAt),
        isExpired: now > end,
        daysLeft,
        hoursLeft,
        minutesLeft,
        exactEndTime: new Date(subscription.trialEndsAt)
      };
    }

    if (subscription.status === 'ACTIVE' && subscription.currentPeriodStart && subscription.currentPeriodEnd) {
      const start = new Date(subscription.currentPeriodStart).getTime();
      const end = new Date(subscription.currentPeriodEnd).getTime();

      const total = end - start;
      const elapsed = now - start;
      const percentage = Math.min(Math.max((elapsed / total) * 100, 0), 100);

      const timeRemaining = Math.max(end - now, 0);
      const daysLeft = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
      const hoursLeft = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutesLeft = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));

      return {
        planType: subscription.cancelAtPeriodEnd ? 'Premium (Canceling)' : 'Premium',
        status: 'ACTIVE' as const,
        percentage,
        timeLeft: timeRemaining > 0 ? `${daysLeft}d ${hoursLeft}h ${minutesLeft}m` : 'Expired',
        endDate: new Date(subscription.currentPeriodEnd),
        isExpired: now > end,
        daysLeft,
        hoursLeft,
        minutesLeft,
        exactEndTime: new Date(subscription.currentPeriodEnd)
      };
    }

    // CANCELED or EXPIRED status
    return {
      planType: subscription.status === 'CANCELED' ? 'Canceled' : 'Expired',
      status: subscription.status as 'CANCELED' | 'EXPIRED',
      percentage: 100,
      timeLeft: 'Expired',
      endDate: subscription.currentPeriodEnd ? new Date(subscription.currentPeriodEnd) : new Date(subscription.trialEndsAt),
      isExpired: true,
      daysLeft: 0,
      hoursLeft: 0,
      minutesLeft: 0,
      exactEndTime: subscription.currentPeriodEnd ? new Date(subscription.currentPeriodEnd) : new Date(subscription.trialEndsAt)
    };
  };

  const details = getSubscriptionDetails();

  const getStatusBadge = () => {
    switch (details.status) {
      case 'ACTIVE':
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle className="w-3 h-3 mr-1" />
            {subscription?.cancelAtPeriodEnd ? 'Active (Canceling)' : 'Active'}
          </Badge>
        );
      case 'TRIAL':
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            <Clock className="w-3 h-3 mr-1" />
            Trial
          </Badge>
        );
      case 'CANCELED':
        return (
          <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">
            <X className="w-3 h-3 mr-1" />
            Canceled
          </Badge>
        );
      case 'EXPIRED':
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Expired
          </Badge>
        );
      default:
        return <Badge variant="secondary">Free</Badge>;
    }
  };

  const getProgressColor = () => {
    if (details.status === 'EXPIRED' || details.status === 'CANCELED') return 'bg-red-500';
    if (details.status === 'TRIAL') return 'bg-blue-500';
    if (details.status === 'ACTIVE') {
      if (details.percentage > 80) return 'bg-orange-500';
      return 'bg-green-500';
    }
    return 'bg-gray-300';
  };

  const formatExactDateTime = (date: Date | null) => {
    if (!date) return 'N/A';
    
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short'
    }).format(date);
  };

  const shouldShowCancelButton = () => {
    return (details.status === 'ACTIVE' || details.status === 'TRIAL') && 
           !subscription?.cancelAtPeriodEnd && 
           onCancelSubscription;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Main Plan Card */}
      <Card className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-50 to-purple-50 rounded-bl-full opacity-50" />
        
        <CardHeader className="relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {details.status !== 'FREE' && <Crown className="w-6 h-6 text-yellow-500" />}
              <div>
                <CardTitle className="text-2xl font-bold">{details.planType} Plan</CardTitle>
                <p className="text-muted-foreground mt-1">
                  {details.status === 'FREE' && 'Basic features with limited access'}
                  {details.status === 'TRIAL' && 'Full access during trial period'}
                  {details.status === 'ACTIVE' && (subscription?.cancelAtPeriodEnd 
                    ? 'Active until end of billing period' 
                    : 'Full premium features included')}
                  {(details.status === 'EXPIRED' || details.status === 'CANCELED') && 'Subscription has ended'}
                </p>
              </div>
            </div>
            {getStatusBadge()}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Progress Section */}
          {details.status !== 'FREE' && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">
                  {details.status === 'TRIAL' ? 'Trial Progress' : 
                   details.status === 'ACTIVE' ? 'Billing Cycle Progress' :
                   details.status === 'CANCELED' ? 'Time Until End' :
                   'Subscription Progress'}
                </span>
                <span className="text-sm text-muted-foreground">{details.percentage.toFixed(1)}%</span>
              </div>
              
              <div className="relative">
                <Progress 
                  value={details.percentage} 
                  className="h-3 bg-gray-200"
                />
                <div 
                  className={`absolute top-0 left-0 h-3 rounded-full transition-all duration-300 ${getProgressColor()}`}
                  style={{ width: `${details.percentage}%` }}
                />
              </div>
              
              {!details.isExpired ? (
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>
                    {details.status === 'TRIAL' ? 'Trial Started' : 
                     details.status === 'ACTIVE' ? 'Billing Started' :
                     'Period Started'}
                  </span>
                  <span className="font-medium text-center">
                    <strong className="text-lg text-foreground">{details.timeLeft}</strong>
                    <br />remaining
                  </span>
                  <span>
                    {details.status === 'TRIAL' ? 'Trial Ends' :
                     details.status === 'ACTIVE' ? (subscription?.cancelAtPeriodEnd ? 'Subscription Ends' : 'Renews') :
                     'Period Ends'}
                  </span>
                </div>
              ) : (
                <div className="text-center py-2">
                  <span className="text-sm font-medium text-red-600">
                    {details.status === 'EXPIRED' ? 'Subscription Expired' : 
                     details.status === 'CANCELED' ? 'Subscription Canceled' : 'Period Ended'}
                  </span>
                </div>
              )}
            </div>
          )}

          <Separator />

          {/* Detailed Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Time Remaining */}
            {details.status !== 'FREE' && (
              <div className="space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {details.isExpired ? 'Subscription Status' : 'Exact Time Remaining'}
                </h3>
                
                {!details.isExpired ? (
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{details.daysLeft}</div>
                      <div className="text-xs text-muted-foreground">Days</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{details.hoursLeft}</div>
                      <div className="text-xs text-muted-foreground">Hours</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{details.minutesLeft}</div>
                      <div className="text-xs text-muted-foreground">Minutes</div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="text-center">
                      <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                      <div className="text-lg font-semibold text-red-800">
                        {details.status === 'EXPIRED' ? 'Subscription Expired' : 'Subscription Ended'}
                      </div>
                      <div className="text-sm text-red-600 mt-1">
                        {details.status === 'EXPIRED' ? 'Renew to continue using premium features' : 
                         details.status === 'CANCELED' ? 'Reactivate to restore premium access' :
                         'Contact support for assistance'}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* End Date Information */}
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {details.status === 'TRIAL' ? 'Trial Ends' : 
                 details.status === 'ACTIVE' ? (subscription?.cancelAtPeriodEnd ? 'Subscription Ends' : 'Next Renewal') : 
                 'Plan Details'}
              </h3>
              
              <div className="space-y-2">
                {details.exactEndTime && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm font-medium mb-2">
                      {formatExactDateTime(details.exactEndTime)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {details.status === 'TRIAL' && 'Trial expires at this exact time'}
                      {details.status === 'ACTIVE' && !subscription?.cancelAtPeriodEnd && 'Will auto-renew at this time'}
                      {details.status === 'ACTIVE' && subscription?.cancelAtPeriodEnd && 'Subscription ends at this time'}
                    </div>
                  </div>
                )}
                
                {details.status === 'FREE' && (
                  <div className="p-3 bg-blue-50 rounded-lg text-blue-800">
                    <div className="text-sm">Upgrade to unlock premium features</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            {details.status === 'FREE' && (
              <Button className="flex-1" size="lg">
                <Crown className="w-4 h-4 mr-2" />
                Upgrade to Premium
              </Button>
            )}
            
            {(details.status === 'EXPIRED' || details.status === 'CANCELED') && (
              <Button className="flex-1" size="lg" onClick={handleReactivateSubscription}>
                <CreditCard className="w-4 h-4 mr-2" />
                Reactivate Subscription
              </Button>
            )}
            
            {shouldShowCancelButton() && (
              <Button 
                variant="outline" 
                size="lg"
                onClick={handleCancelSubscription}
                disabled={isLoading}
                className="border-red-200 text-red-600 hover:bg-red-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Canceling...
                  </>
                ) : (
                  <>
                    <X className="w-4 h-4 mr-2" />
                    Cancel Plan
                  </>
                )}
              </Button>
            )}

            {subscription?.cancelAtPeriodEnd && (
              <Button variant="outline" size="lg" className="border-green-200 text-green-600 hover:bg-green-50">
                <CheckCircle className="w-4 h-4 mr-2" />
                Reactivate Plan
              </Button>
            )}
          </div>

          {/* Warnings and Notices */}
          {subscription?.cancelAtPeriodEnd && (
            <div className="flex items-start gap-3 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-orange-800">Subscription Set to Cancel</h4>
                <p className="text-sm text-orange-700 mt-1">
                  Your subscription will end on {details.exactEndTime && formatExactDateTime(details.exactEndTime)}. 
                  You can reactivate it anytime before this date.
                </p>
              </div>
            </div>
          )}

          {/* Warning for low time remaining */}
          {(details.status === 'ACTIVE' || details.status === 'TRIAL') && 
           details.daysLeft <= 3 && 
           !details.isExpired && 
           !subscription?.cancelAtPeriodEnd && (
            <div className="flex items-start gap-3 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-orange-800">
                  Your {details.status === 'TRIAL' ? 'trial' : 'subscription'} is ending soon
                </h4>
                <p className="text-sm text-orange-700 mt-1">
                  {details.status === 'TRIAL' 
                    ? 'Your trial will expire soon. Upgrade to continue using premium features.'
                    : 'Your subscription will renew automatically unless canceled.'
                  }
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Feature Comparison (Optional) */}
      {details.status === 'FREE' && (
        <Card>
          <CardHeader>
            <CardTitle>Upgrade Benefits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">Unlimited Access</h3>
                <p className="text-sm text-muted-foreground">Access all premium features without restrictions</p>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Crown className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">Priority Support</h3>
                <p className="text-sm text-muted-foreground">Get faster response times and dedicated help</p>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CreditCard className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">Advanced Features</h3>
                <p className="text-sm text-muted-foreground">Unlock powerful tools and integrations</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PlanUsage;