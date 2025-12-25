import { PaymentStatus } from '@prisma/client';

type Props = {
  current: PaymentStatus | undefined;
  label: string; // Add label to display plan type
};

const PaymentCard = ({ current, label }: Props) => {
  const isPro = current === 'SUCCEEDED';

  return (
    <div className="p-6 rounded-xl bg-background-90 shadow-md max-w-md">
      <h2 className="text-2xl font-bold mb-2">
        {label}: {isPro ? 'Premium Plan' : 'Standard Plan'}
      </h2>

      <p className="text-sm text-text-secondary mb-4">
        {isPro
          ? 'You are on the Pro plan with full access to all features.'
          : 'You are on the Standard plan. Upgrade to Pro for premium features.'}
      </p>

      <p className="text-xl font-semibold mb-4">
        {isPro ? '$9.99 / month' : 'Free'}
      </p>

      <button
        className={`px-5 py-2 rounded-full text-white ${
          isPro ? 'bg-green-500 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
        }`}
        disabled={isPro}
      >
        {isPro ? 'Active' : 'Upgrade'}
      </button>
    </div>
  );
};

export default PaymentCard;
