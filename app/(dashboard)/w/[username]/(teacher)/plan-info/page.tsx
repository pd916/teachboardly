import { getSelf } from '@/lib/auth-service';
import { getUserSubscriptionStatus } from '@/lib/get-user-subscribtion';
import React from 'react'
import PlanUsage from '../_component/plan-usage';
import { cancelSubscription, reactivateSubscription } from '@/actions/payment-cancel';

const page = async () => {
  const self = await getSelf()

    if(!self) return;

    const {data: subscriptionData } = await getUserSubscriptionStatus(self.id);
  return (
    <div>
      <PlanUsage
       subscription={subscriptionData}
       onCancelSubscription={cancelSubscription}
        onReactivateSubscription={reactivateSubscription}
      />
    </div>
  )
}

export default page
