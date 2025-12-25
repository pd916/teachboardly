import { getSelf } from '@/lib/auth-service';
import { getUserSubscriptionStatus } from '@/lib/get-user-subscribtion';
import React from 'react'
import PaymentCard from '@/components/payment/payment-card';
// import { cancelSubscription, reactivateSubscription } from '@/actions/payment';

const page = async () => {
  const self = await getSelf()

    if(!self) return;

    const user = await getUserSubscriptionStatus(self.id);

     const currentPlanLabel = user?.subscription?.status === 'SUCCEEDED' ? 'Premium Plan' : 'Standard Plan';
  return (
    <div>
       <div className='flex lg:flex-row flex-col gap-5 w-full lg:w-10/12 xl:w-8/12 container'>
        <PaymentCard
        current={user?.subscription?.status }
        label={currentPlanLabel} 
        />
    </div>
    </div>
  )
}

export default page
