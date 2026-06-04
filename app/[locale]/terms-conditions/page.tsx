import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { isLocale, locales, type Locale } from '@/lib/i18n/config'
import { localeHref } from '@/lib/i18n/href'

export const dynamic = 'force-static'

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export const metadata: Metadata = {
  title: 'Terms & Conditions',
  description:
    'The terms and conditions governing your use of Gifted and the purchase of gift cards through our marketplace.',
  robots: { index: true, follow: true },
}

const LAST_UPDATED = '2026-06-04'

interface TermsConditionsProps {
  params: { locale: string }
}

export default function TermsConditionsPage({ params }: TermsConditionsProps) {
  if (!isLocale(params.locale)) notFound()
  const locale: Locale = params.locale
  const href = (path: string) => localeHref(locale, path)
  const currentYear = new Date().getFullYear()

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-3xl">
        <article className="prose prose-slate max-w-none">
          <h1 className="font-archivo text-3xl sm:text-4xl font-bold mb-2">
            Terms &amp; Conditions
          </h1>
          <p className="text-body-sm text-surface-on-surface-variant mb-8">
            Last updated: {LAST_UPDATED}
          </p>

          <p className="text-body-md mb-8">
            Please read these Terms carefully before accessing or using the
            Gifted website and our services. By using the Site, you expressly
            agree to be bound by these Terms. If you do not agree to these
            Terms, you must not use the Site or purchase gift cards through it.
          </p>

          <section className="mb-8">
            <h2 className="font-archivo text-title-lg font-semibold mb-3">
              1. Introduction
            </h2>
            <p className="text-body-md">
              Gifted is an online marketplace operated by Gifted Tech, LLC that
              facilitates the purchase of prepaid digital gift cards
              (&ldquo;Gift Cards&rdquo;) issued by third-party brands and
              retailers. These gift cards are fulfilled through third-party
              gift-card suppliers. Your access to and use of the Gifted website
              (the &ldquo;Site&rdquo;) and our services (together, the
              &ldquo;Services&rdquo;) are subject to your acceptance of these
              terms and conditions (the &ldquo;Agreement&rdquo; or
              &ldquo;Terms&rdquo;). By using the Site, you expressly agree to be
              bound by these Terms. You should keep a copy of these Terms for
              your records.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-archivo text-title-lg font-semibold mb-3">
              2. Information About Us
            </h2>
            <p className="text-body-md">
              The Site is operated, and the Services are provided, by{' '}
              <strong>Gifted Tech, LLC</strong> (&ldquo;Gifted&rdquo;,
              &ldquo;we&rdquo;, &ldquo;us&rdquo; or &ldquo;our&rdquo;), a limited
              liability company formed under the laws of the State of Delaware,
              USA, with U.S. Employer Identification Number (EIN){' '}
              <strong>36-5179655</strong>. Our business and mailing address is{' '}
              <strong>
                1111B S Governors Ave, Suite 91924, Dover, DE 19904, USA
              </strong>
              . You can contact us using the details in Section 18 (Customer
              Care &amp; Contact Information) below.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-archivo text-title-lg font-semibold mb-3">
              3. Eligibility and Guest Checkout
            </h2>
            <p className="text-body-md">
              Gifted does not currently require you to create an account;
              purchases are made as a guest by providing the information
              requested at checkout, including a valid email address and payment
              details. You agree that all information you provide will be
              truthful, accurate and complete, and you are responsible for
              keeping it up to date. You must be at least 18 years old (or the
              age of majority in your jurisdiction) to purchase a Gift Card. If
              you are using the Services on behalf of a company or other entity,
              you represent that you are authorised to accept these Terms on its
              behalf. You are responsible for all activity carried out using
              your email address and payment method in connection with the
              Services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-archivo text-title-lg font-semibold mb-3">
              4. Your Data
            </h2>
            <p className="text-body-md">
              Gifted complies with applicable data-protection law with respect
              to personal data it holds about you. Data we collect as part of
              the Services is handled in accordance with our{' '}
              <Link
                href={href('/privacy')}
                className="underline text-secondary hover:text-secondary-hover"
              >
                Privacy Policy
              </Link>{' '}
              and{' '}
              <Link
                href={href('/cookie-policy')}
                className="underline text-secondary hover:text-secondary-hover"
              >
                Cookie Policy
              </Link>
              , which explain how we use and protect your information. We
              recommend you read both carefully.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-archivo text-title-lg font-semibold mb-3">
              5. Use of the Services and Cost
            </h2>
            <p className="text-body-md">
              You agree to use the Site and Services solely in accordance with
              these Terms and applicable law. You may not use the Site or
              Services: (i) in violation of any law, statute, rule or
              regulation; (ii) in connection with any illegal, fraudulent,
              offensive or otherwise improper activity; or (iii) in any manner
              that encourages, promotes, facilitates or instructs others to do
              so.
            </p>
            <p className="text-body-md mt-3">
              When purchasing a Gift Card, you select the brand and the
              denomination (face value) you wish to buy and enter the
              recipient&rsquo;s delivery email address where applicable. It is
              your responsibility to ensure the information you enter &mdash;
              including the recipient email address and the denomination &mdash;
              is correct. The total amount payable (inclusive of any applicable
              taxes and fees) is displayed clearly before you confirm your
              order; proceeding with the order at that point is entirely
              optional. A processing or service fee may apply and, where the
              Gift Card is denominated in a currency other than the currency of
              your payment method, the amount charged will be subject to the
              applicable foreign-exchange rate on the payment date.
            </p>
            <p className="text-body-md mt-3">
              Gift Cards are delivered upon successful payment, usually by email
              to the address you provide. Occasionally there may be a short
              delay before our third-party supplier delivers the Gift Card.
              Because a Gift Card can be redeemed immediately once delivered,{' '}
              <strong>
                a Gift Card cannot be cancelled, refunded or exchanged once it
                has been delivered
              </strong>
              , except as required by applicable law or as set out in Section 6.
              To avoid a Gift Card being sent to the wrong address, please
              confirm that the recipient details you have entered are correct
              before completing your purchase. Gifted may limit the number or
              value of Gift Cards that can be purchased, including over a given
              time period, and other limits or exclusions may apply from time to
              time.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-archivo text-title-lg font-semibold mb-3">
              6. Refunds and Order Errors
            </h2>
            <p className="text-body-md">
              Because Gift Cards are delivered electronically and can be
              redeemed immediately, all sales are final once a Gift Card has
              been delivered. If your order fails, is not delivered, or you are
              charged for an order that was not fulfilled, contact us using the
              details in Section 18 and we will investigate and, where
              appropriate, issue a refund or re-deliver the Gift Card. Where the
              issuing brand&rsquo;s own terms provide additional rights (for
              example in the case of a faulty or non-functioning Gift Card),
              those terms apply in addition to this Section.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-archivo text-title-lg font-semibold mb-3">
              7. Transactions and Payment
            </h2>
            <p className="text-body-md">
              You may pay for Gift Cards using the payment methods made
              available at checkout (which may include major credit and debit
              cards and other supported methods). Any payment method you use
              must have a valid billing address and a valid issuing bank or
              payment-services provider. Upon receipt of a complete and
              authorised order, Gifted will charge your chosen payment method
              and submit an electronic request to the relevant third-party
              supplier to issue the Gift Card for the benefit of the recipient
              you nominate.
            </p>
            <p className="text-body-md mt-3">
              You authorise Gifted to charge your chosen payment method for any
              order you submit through the Site. Gifted may carry out fraud,
              security and identity-verification checks as it considers
              appropriate or as required by law, and may decline or cancel any
              order it reasonably believes to be fraudulent, unauthorised, or in
              breach of these Terms. All charges arising from an order you have
              authorised are your responsibility. Gifted&rsquo;s liability for
              the non-delivery or defective delivery of a Gift Card, subject to
              your compliance with these Terms and absent fraud,
              misrepresentation or negligence on your part, is strictly limited
              to the amount paid for that Gift Card.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-archivo text-title-lg font-semibold mb-3">
              8. Promotions
            </h2>
            <p className="text-body-md">
              From time to time Gifted or its partners may run promotions on the
              Site. Such promotions may be subject to additional terms and
              conditions, which will be displayed clearly at the time. Gifted is
              not responsible for promotions run by third parties, and you
              should make your own enquiries with the relevant party before
              relying on any such promotion. You agree to use any promotion in
              good faith and not to misuse any promotional code.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-archivo text-title-lg font-semibold mb-3">
              9. Third-Party Gift Cards and Suppliers
            </h2>
            <p className="text-body-md">
              Gift Cards available through Gifted are issued by third-party
              brands and supplied through third-party gift-card distributors.
              Each Gift Card is subject to the issuing brand&rsquo;s own terms
              and conditions, including any expiry dates, redemption
              restrictions and territorial limitations. Gifted does not control
              and is not responsible for the goods, services, availability,
              redemption or terms of any third-party brand, and does not warrant
              the accuracy or completeness of third-party information shown on
              the Site. You should review the issuing brand&rsquo;s terms before
              purchasing and before redeeming a Gift Card. The issuing brand
              and/or supplier is responsible for all aspects of the Gift Card it
              provides.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-archivo text-title-lg font-semibold mb-3">
              10. Your Obligations
            </h2>
            <p className="text-body-md">
              You are responsible, at your own expense, for the equipment,
              devices and internet connection needed to access the Site, and for
              any charges your provider applies for that access. You must comply
              with these Terms in order to reduce the risk of unauthorised use
              of the Site and harm to you, Gifted or others. To the fullest
              extent permitted by law, you will be liable for any loss, cost,
              damage or liability suffered by Gifted or any third party as a
              result of your breach of these Terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-archivo text-title-lg font-semibold mb-3">
              11. Your Contributions
            </h2>
            <p className="text-body-md">
              If you send Gifted any feedback, suggestions, ideas or other
              materials relating to the Site or Services, you agree that Gifted
              may use, reproduce, publish, modify, adapt and share them, free of
              charge and without restriction, subject to Gifted&rsquo;s
              obligations under our Privacy Policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-archivo text-title-lg font-semibold mb-3">
              12. Intellectual Property Rights
            </h2>
            <p className="text-body-md">
              &ldquo;Intellectual Property Rights&rdquo; means all copyright,
              patents, registered and unregistered trademarks, design rights,
              database rights and any other intellectual-property rights
              anywhere in the world. You may access, view and use the Site
              solely for the purpose of using the Services and in accordance
              with these Terms. Except where otherwise stated, the Intellectual
              Property Rights in and the contents of the Site are owned by Gifted
              Tech, LLC or its licensors. You may not reproduce, copy, modify,
              adapt or distribute any part of the Site (including any graphics or
              trademarks) without our prior written consent, other than as
              needed for your personal, non-commercial use of the Services.
              Gifted owns all Intellectual Property Rights in the name
              &ldquo;GIFTED&rdquo; and any accompanying logo, and in the Gifted
              domain names. Third-party brand names and logos shown on the Site
              are the property of their respective owners and are used to
              identify the Gift Cards available for purchase.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-archivo text-title-lg font-semibold mb-3">
              13. Suspension and Withdrawal of Services
            </h2>
            <p className="text-body-md">
              These Terms apply to every Gift Card you purchase through the Site.
              Gifted may suspend, restrict or withdraw your access to the Site or
              the Services: (i) on reasonable prior notice; (ii) immediately
              where you breach, or Gifted reasonably believes you are in breach
              of, these Terms; (iii) immediately where Gifted reasonably believes
              you have used the Site or Services in violation of any law, or in
              connection with any illegal, fraudulent or improper activity, or in
              breach of any limits Gifted has set; or (iv) as needed for
              maintenance, security or to address a technical issue (see Section
              14). Gifted is not responsible for any loss you may incur as a
              result of an order not being processed following such suspension or
              withdrawal. You may stop using the Services at any time.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-archivo text-title-lg font-semibold mb-3">
              14. Availability, Security and Maintenance
            </h2>
            <p className="text-body-md">
              Gifted aims to keep the Site available but does not guarantee
              uninterrupted access. From time to time it may be necessary, for
              maintenance (planned or emergency), upgrades, security or other
              reasons, to make all or part of the Site or Services temporarily
              unavailable, to delay new features, or to change security or
              verification procedures, using reasonable efforts to minimise
              inconvenience. You acknowledge that electronic communications and
              the internet are not always secure and may be intercepted or
              delayed; while Gifted (and its suppliers) put appropriate security
              measures in place, Gifted cannot guarantee the absolute
              confidentiality of communications sent over such media. Gifted
              bears no liability where such events occur.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-archivo text-title-lg font-semibold mb-3">
              15. Force Majeure
            </h2>
            <p className="text-body-md">
              Gifted shall not be liable for, or in breach of, its obligations
              under these Terms where performance is prevented or delayed by any
              event beyond its reasonable control, including acts of God, fire,
              flood, war, civil unrest, government action, embargo, failure of
              any computer, network, payment or settlement system,
              telecommunications failure, inability to obtain supplies, or labour
              disputes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-archivo text-title-lg font-semibold mb-3">
              16. Limitation of Liability
            </h2>
            <p className="text-body-md">
              Gifted bears no responsibility for any use of the Site or Services
              in connection with any unauthorised, illegal, fraudulent or
              improper activity. Save as set out in Section 7, to the fullest
              extent permitted by law Gifted and its members, managers,
              employees, officers and agents exclude all liability for any loss
              or damage of any kind (including any direct, indirect, incidental,
              special, consequential, exemplary or punitive loss, or any loss of
              income, money, data or goodwill) arising out of or in connection
              with your use of the Site, the Gift Cards or the Services. Nothing
              in these Terms limits liability for death or personal injury caused
              by our negligence, for fraud, or for any other liability that
              cannot lawfully be excluded. Where Gifted is liable, that liability
              is strictly limited to the amount you paid for the Gift Card(s)
              giving rise to the claim. The Site, the Services and their content
              are provided &ldquo;as is&rdquo; and, to the fullest extent
              permitted by law, Gifted makes no warranties as to their
              availability or fitness for any particular purpose.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-archivo text-title-lg font-semibold mb-3">
              17. General Terms
            </h2>
            <p className="text-body-md">
              <strong>Variations.</strong> Gifted may modify these Terms for
              commercial or legal reasons. Changes become effective fourteen (14)
              days after we post the updated Terms on the Site or otherwise
              notify you, and your continued use of the Services after that date
              constitutes acceptance.
            </p>
            <p className="text-body-md mt-3">
              <strong>Links to other websites.</strong> The Site may link to
              third-party websites that Gifted does not control; Gifted is not
              responsible for their content, availability or practices, and you
              access them at your own risk.
            </p>
            <p className="text-body-md mt-3">
              <strong>Assignment.</strong> You may not assign or transfer your
              rights or obligations under these Terms; Gifted may assign these
              Terms to an affiliate or successor.
            </p>
            <p className="text-body-md mt-3">
              <strong>Severability.</strong> If any provision of these Terms is
              or becomes illegal, invalid or unenforceable, the remaining
              provisions continue in full force and effect.
            </p>
            <p className="text-body-md mt-3">
              <strong>Waiver.</strong> No delay or failure by Gifted to exercise
              any right is a waiver of that right, and no waiver of any breach is
              a waiver of any subsequent breach.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-archivo text-title-lg font-semibold mb-3">
              18. Governing Law and Disputes
            </h2>
            <p className="text-body-md">
              These Terms, the Site and the provision of the Services are
              governed by the laws of the{' '}
              <strong>State of Delaware, USA</strong>, without regard to its
              conflict-of-laws rules. Subject to any mandatory consumer-protection
              rights available to you under the law of your country of
              residence, you agree that the state and federal courts located in
              the State of Delaware shall have exclusive jurisdiction over any
              claim or dispute arising out of or in connection with these Terms
              or your use of the Site or Services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-archivo text-title-lg font-semibold mb-3">
              19. Customer Care &amp; Contact Information
            </h2>
            <p className="text-body-md">
              If you have any questions about these Terms, a complaint, or need
              help with the Site or the Services, please contact us:
            </p>
            <ul className="list-disc pl-6 text-body-md mt-2 space-y-1">
              <li>
                <strong>Email:</strong>{' '}
                <a
                  href="mailto:support@gifted.app"
                  className="underline text-secondary hover:text-secondary-hover"
                >
                  support@gifted.app
                </a>
              </li>
              <li>
                <strong>Postal address:</strong> Gifted Tech, LLC, 1111B S
                Governors Ave, Suite 91924, Dover, DE 19904, USA
              </li>
            </ul>
          </section>

          <p className="text-body-sm text-surface-on-surface-variant mt-12">
            &copy; {currentYear} Gifted Tech, LLC. All rights reserved.
          </p>
        </article>
      </main>
      <Footer />
    </>
  )
}
