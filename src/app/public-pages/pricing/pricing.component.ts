import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './pricing.component.html',
  styleUrl: './pricing.component.scss'
})
export class PricingComponent {
  readonly billingYearly = signal(false);
  readonly openFaqIndex = signal<number | null>(0);

  toggleBilling(yearly: boolean) {
    this.billingYearly.set(yearly);
  }

  toggleFaq(index: number) {
    this.openFaqIndex.update(curr => curr === index ? null : index);
  }

  readonly plans = [
    {
      name: 'Free',
      tagline: 'Great for individuals and small projects.',
      icon: 'send',
      iconBg: 'bg-blue-50 dark:bg-blue-900/20',
      iconColor: 'text-[#0052FF]',
      monthlyPrice: 0,
      yearlyPrice: 0,
      priceLabel: '$0',
      ctaLabel: 'Get Started',
      ctaClass: 'border border-[#0052FF] text-[#0052FF] hover:bg-blue-50 dark:hover:bg-blue-900/20',
      popular: false,
      features: [
        { text: 'Up to 1,000 notifications/month', included: true },
        { text: 'Email & In-App', included: true },
        { text: 'Basic templates', included: true },
        { text: 'Community support', included: true },
        { text: 'SMS, Push, Webhook', included: false },
        { text: 'Advanced analytics', included: false },
      ]
    },
    {
      name: 'Starter',
      tagline: 'Perfect for growing applications.',
      icon: 'users',
      iconBg: 'bg-blue-50 dark:bg-blue-900/20',
      iconColor: 'text-[#0052FF]',
      monthlyPrice: 19,
      yearlyPrice: 15,
      priceLabel: '$19',
      ctaLabel: 'Get Started',
      ctaClass: 'border border-[#0052FF] text-[#0052FF] hover:bg-blue-50 dark:hover:bg-blue-900/20',
      popular: false,
      features: [
        { text: 'Up to 10,000 notifications/month', included: true },
        { text: 'Email, SMS, Push, In-App', included: true },
        { text: 'Template management', included: true },
        { text: 'Basic analytics', included: true },
        { text: 'Email support', included: true },
        { text: 'Advanced features', included: false },
        { text: 'Dedicated support', included: false },
      ]
    },
    {
      name: 'Professional',
      tagline: 'For businesses with higher communication needs.',
      icon: 'team',
      iconBg: 'bg-white dark:bg-white/10',
      iconColor: 'text-white',
      monthlyPrice: 49,
      yearlyPrice: 39,
      priceLabel: '$49',
      ctaLabel: 'Get Started',
      ctaClass: 'bg-white text-[#0052FF] hover:bg-gray-100',
      popular: true,
      features: [
        { text: 'Up to 100,000 notifications/month', included: true },
        { text: 'All channels (Email, SMS, Push, In-App, Webhook)', included: true },
        { text: 'Advanced templates & variables', included: true },
        { text: 'Real-time analytics', included: true },
        { text: 'Priority support', included: true },
        { text: 'API access & webhooks', included: true },
        { text: 'Dedicated account manager', included: true },
      ]
    },
    {
      name: 'Enterprise',
      tagline: 'For large organizations with custom needs.',
      icon: 'building',
      iconBg: 'bg-purple-50 dark:bg-purple-900/20',
      iconColor: 'text-purple-600 dark:text-purple-400',
      monthlyPrice: null,
      yearlyPrice: null,
      priceLabel: 'Custom Pricing',
      ctaLabel: 'Contact Sales',
      ctaClass: 'border border-[#0052FF] text-[#0052FF] hover:bg-blue-50 dark:hover:bg-blue-900/20',
      popular: false,
      features: [
        { text: 'Unlimited notifications', included: true },
        { text: 'All channels and features', included: true },
        { text: 'Custom integrations', included: true },
        { text: 'SLA & dedicated infrastructure', included: true },
        { text: 'Advanced security & compliance', included: true },
        { text: 'Dedicated account manager', included: true },
        { text: '24/7 priority support', included: true },
      ]
    },
  ];

  readonly faqs = [
    {
      q: 'Can I change my plan later?',
      a: 'Yes, you can upgrade or downgrade your plan at any time. The changes will be applied to your next billing cycle.'
    },
    {
      q: 'Is there a free trial for paid plans?',
      a: 'Yes! All paid plans come with a 14-day free trial. No credit card required to start.'
    },
    {
      q: 'What payment methods do you accept?',
      a: 'We accept all major credit cards (Visa, MasterCard, American Express), as well as PayPal and bank transfers for Enterprise plans.'
    },
    {
      q: 'Do you offer refunds?',
      a: 'We offer a 30-day money-back guarantee on all paid plans. If you are not satisfied, contact our support team within 30 days of purchase.'
    },
  ];
}
