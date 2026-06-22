import React from "react";
import { Typography, Box, Paper, Container } from "@mui/material";

const Terms = () => (
  <Container maxWidth="md" sx={{ py: { xs: 3, md: 5 } }}>
    <Paper sx={{ p: { xs: 3, md: 5 }, borderRadius: 3, border: "1px solid", borderColor: "divider" }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" sx={{ color: "text.secondary", mb: 1 }}>
          Home / Terms & Conditions
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 700, letterSpacing: "-0.02em" }}>
          Terms & Conditions
        </Typography>
        <Typography variant="subtitle2" sx={{ color: "text.secondary", mt: 0.5 }}>
          MYZOO LTD. | MYZOO.ASIA
        </Typography>
      </Box>

      <Typography variant="h6" sx={{ fontWeight: 700, mt: 2 }}>USER TERMS & CONDITIONS</Typography>

      <Typography variant="body1" sx={{ color: "text.secondary", lineHeight: 1.8, mt: 1.5 }}>
        The following terms and conditions ("UUT&C") govern your access to and use of MYZOO.ASIA (the
        "Site") owned and operated by MYZOO LTD. ("MYZOO.ASIA"), including any content, functionality
        and services offered. Please read these UUT&C carefully before you start using this site.
      </Typography>

      <Typography variant="body1" sx={{ color: "text.secondary", lineHeight: 1.8, mt: 1.5 }}>
        By clicking the "agree" button, you ("USER") agree to be bound by these UT&C at all times.
        Non-acceptance of the UT&C shall disallow you from using the site.
      </Typography>

      <Typography variant="body1" sx={{ color: "text.secondary", lineHeight: 1.8, mt: 1.5 }}>
        For the purpose of these UUT&C, wherever the context so requires "YOU" or "USER" shall mean
        any natural or legal person who has agreed to become a buyer on the Platform by providing
        Registration Information while registering on the site as registered user using the computer
        systems or handheld or mobile phone device. The term "WE", "US", "OUR" shall mean MYZOO LTD.
      </Typography>

      <Typography variant="body1" sx={{ color: "text.secondary", lineHeight: 1.8, mt: 1.5 }}>
        When you use any of the services provided by MYZOO LTD. through the site, including yourself
        shall be subject to the rules, guidelines, policies, terms, and conditions applicable to such
        service, and they shall be deemed to be incorporated into this UT&C and shall be considered
        as part and parcel of this UT&C. MYZOO LTD. reserves the right, at its sole discretion, to
        change, modify, add or remove portions of these Terms of Use, at any time without any prior
        written notice given to YOU. It is your responsibility to review these UT&C periodically for
        updates or changes. Your continued use of the site following the posting of changes will mean
        that YOU accept and agree to the revisions.
      </Typography>

      <Typography variant="body1" sx={{ color: "text.secondary", lineHeight: 1.8, mt: 1.5 }}>
        If YOU have any questions regarding the site or the UT&C, please contact MYZOO LTD's customer
        support team by submitting a request here [insert].
      </Typography>

      <Typography variant="h6" sx={{ fontWeight: 700, mt: 3 }}>Personal Information and Data</Typography>

      <Typography variant="body1" sx={{ color: "text.secondary", lineHeight: 1.8, mt: 1 }}>
        Personal Information: When you use our services, we may collect personal information such as
        your name, email address, phone number, and billing information.
      </Typography>
      <Typography variant="body1" sx={{ color: "text.secondary", lineHeight: 1.8, mt: 1 }}>
        Usage Data: We collect information about how you interact with our services. This may include
        your IP address, browser type, device identifiers, pages visited, and other usage statistics.
      </Typography>
      <Typography variant="body1" sx={{ color: "text.secondary", lineHeight: 1.8, mt: 1 }}>
        Camera Usage: With your explicit consent, we may access your device's camera to provide certain
        features or services. This may include capturing images or videos for identification purposes
        or enabling augmented reality experiences.
      </Typography>
      <Typography variant="body1" sx={{ color: "text.secondary", lineHeight: 1.8, mt: 1 }}>
        Location Data: With your explicit consent, we may collect location data from your device to
        provide location-based services or improve the functionality of our services. You can enable
        or disable location services at any time through your device settings.
      </Typography>

      <Typography variant="h6" sx={{ fontWeight: 700, mt: 3 }}>How We Use Your Data</Typography>
      <Typography variant="body1" sx={{ color: "text.secondary", lineHeight: 1.8, mt: 1 }}>
        Providing and Improving Services: We use the information collected to deliver, maintain, and
        improve our services, including personalizing your experience, troubleshooting technical issues,
        and developing new features.
      </Typography>
      <Typography variant="body1" sx={{ color: "text.secondary", lineHeight: 1.8, mt: 1 }}>
        Communication: We may use your contact information to send you important updates, announcements,
        or promotional offers related to our services. You can opt-out of receiving marketing communications
        at any time.
      </Typography>
      <Typography variant="body1" sx={{ color: "text.secondary", lineHeight: 1.8, mt: 1 }}>
        Security: Your data is important to us, and we take appropriate measures to protect it from
        unauthorized access, disclosure, alteration, or destruction.
      </Typography>
      <Typography variant="body1" sx={{ color: "text.secondary", lineHeight: 1.8, mt: 1 }}>
        Legal Compliance: We may use your information to comply with legal obligations, enforce our
        policies, or respond to legal requests from authorities.
      </Typography>

      <Typography variant="h6" sx={{ fontWeight: 700, mt: 3 }}>Sharing of Data</Typography>
      <Typography variant="body1" sx={{ color: "text.secondary", lineHeight: 1.8, mt: 1 }}>
        Third-Party Service Providers: We may share your data with trusted third-party service providers
        who assist us in operating our business, such as payment processors, analytics providers, or
        cloud hosting services. These providers are contractually obligated to safeguard your data and
        only use it for specified purposes.
      </Typography>
      <Typography variant="body1" sx={{ color: "text.secondary", lineHeight: 1.8, mt: 1 }}>
        Legal Requirements: We may disclose your information if required to do so by law or in response
        to valid legal requests, such as court orders or subpoenas.
      </Typography>

      <Typography variant="body1" sx={{ color: "text.secondary", lineHeight: 1.8, mt: 2 }}>
        YOU hereby undertake, warrant, agree and/or understand that:
      </Typography>

      <Box component="ol" sx={{ pl: 3, mt: 1.5, color: "text.secondary", lineHeight: 1.8 }}>
        <li>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "text.primary" }}>REGISTRATION</Typography>
          <Box component="ol" sx={{ pl: 3, mt: 1 }}>
            <li>In order to access the services offered by the site ("SERVICES"), USER/s shall have to create an account. The relevant information shall be required to create an account by way of providing your [INSERT].</li>
            <li>YOU confirm that all information provided by YOU is complete and accurate at all times. This information will be held and used by the site in accordance with our Privacy Policy, which can be found at [INSERT LINK] ("PRIVACY POLICY").</li>
            <li>Upon clicking accept and completing registration with MYZOO LTD., you are entering into a binding contract with MY= LTD. - a company registered in Bangladesh under the Companies Act, 1994.</li>
            <li>By entering the site, you affirm that you are of legal age to form legally binding contract/s, and that you are at least 18 years old or if otherwise, you are under the control of a parent or legal guardian. We hereby give you a non-exclusive, non-transferable, revocable license to access the site, for the purposes of purchasing goods and services that are available on the site, in compliance with the UT&C mentioned herein. Commercial use or use on behalf of a third party is not allowed until we have expressly approved it in advance.</li>
            <li>By entering the site, you affirm that that you are using the site's resources and transacting at your own expense and that you are using your prudent judgement before entering into any transactions. The site or MYZOO LTD. shall not be held liable or responsible for the acts or inactions of vendors/sellers, as well as any violation of terms by YOU. MYZOO.ASIA site does not make any, and specifically denies any and all duty and liability in respect of any representation, guarantee or warrantee made by any vendors and/or seller/s on the site. MYZOO.ASIA shall not serve as a mediator or arbitrator in any dispute or conflict between YOU and the product's sellers or suppliers or vendors.</li>
            <li>By registering with the site, YOU agree to abide by the UT&C at all times, not to abuse the site in any way or manner, and not access or use the site using any automated software.</li>
            <li>You are responsible for safeguarding your password and use of the services occurring under your credentials at all times.</li>
            <li>Attempts to breach security of the site on any computer or mobile network or access an account that does not belong to you on the site is strictly prohibited. YOU shall immediately notify MYZOO LTD. if you discover or otherwise suspect any security breaches related to the services on your account.</li>
            <li>To prevent fraud or abuse, only one registered account is allowed. Any attempt to create additional account shall be invalid and may result in the revocation of the license issued immediately and without any notice.</li>
            <li>The site or MYZOO LTD. is not liable for any technical glitches beyond the apps or site's control at all times.</li>
            <li>The site reserves the right in its absolute discretion to remove, reject or modify any content posted or displayed on the site.</li>
          </Box>
        </li>

        <li>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "text.primary" }}>TERMS OF USE</Typography>
          <Box component="ol" sx={{ pl: 3, mt: 1 }}>
            <li>The site is an e-commerce marketplace platform that allows buyers or customers or users make purchases products/goods from MYZOO LTD. PARTNERS using the MYZOO app or visiting the WWW.MYZOO.ASIA by placing orders via the MYZOO.ASIA site or MYZOO app. MYZOO LTD. is merely a platform as the facilitator and are not a party to or in any way monitoring any transactions on the site or via a payment portal operated by a third-party service provider.</li>
            <li>The selling of goods on the site shall be a purely bipartite arrangement between the user and MYZOO LTD. on the site, with payment processing taking place between the user and MYZOO LTD. and the user's issuer bank in the case of prepayments of electronic cards.</li>
            <li>The site does not make any representation or warranty of the quality, value, saleability, etc. of the goods or products or services listed to be sold on the site once the same, i.e., goods/product is dispatched or service delivered, and MYZOO LTD. accepts no liability for any errors or omissions thereafter.</li>
            <li>YOUR order is a request to MYZOO LYD. to sell and deliver the products/foods displayed on the site to you, by the MYZOO LTD. PARTNER or delivery persons which shall only be binding upon ZOO upon completion of making the payment to MYZOO LTD., subject to availability of the goods or product or food. Upon placing an order over the app/site, any confirmations or status reports sent by the site to YOU is a verification of the order that has been placed. The dispatch of the product/food shall be construed as confirmation of your order. YOU may receive different dispatch confirmations if the order is shipped in several packages.</li>
            <li>The site or MYZOO LTD. has no obligation with payment types, payment terms, warranties for goods and services, and after-sales support for products or goods in any way.</li>
            <li>All orders made on the site are subject to stock supply of the MYZOO LTD. PARTNER, therefore the app/site or MYZOO LTD. is not responsible for unsatisfactory or delayed performance of services or damages or delays as a result of products which are out of stock, unavailable or back ordered.</li>
            <li>Any use or reliance on any content or materials obtained or viewed by you through the site is at your own risk, and MYZOO LTD. does not take the liability if in case you find such content offensive, harmful, inaccurate or otherwise inappropriate for you.</li>
            <li>All business transactions conducted over the app/site shall be done in good faith, and that the site or its services shall not be used for defrauding any individual or entity;</li>
            <li>No stolen or misappropriated credit/debit cards or MFS such as Bkash or Nagad number/accounts shall be used to make payments on the site;</li>
            <li>You shall not use the site to engage in business activities which are similar or identical to, or for the purpose of competing directly or indirectly with the site or MYZOO LTD.</li>
            <li>You shall not engage in any activity/ies that may create any legal liability for MYZOO LTD;</li>
            <li>You shall hold MYZOO LTD. harmless from any liability arising out of their actions or omissions and reimburse the site for any loss or damage suffered for the same.</li>
            <li>To place a complaint, or consult with a representative of customer care service, please click on the following link: [INSERT LINK]</li>
            <li>MYZOO LTD. reserves the right to monitor the materials posted on the site, and has the right to remove or edit any content that in its sole discretion violates, or is alleged to violate, any applicable law or these UT&C.</li>
            <li>The site or MYZOO LTD. shall have no responsibility or liability for any damage or loss to the goods or product after acceptance of delivery.</li>
            <li>If an order is cancelled, the money paid for that order will be refunded within at least 15 business days, subject to any deduction that may be applicable for any statutory purpose of third-party involvement. The user or you agree that in exceptional circumstances, the time for refund may take longer. Any cash back earned by the user may be balanced or set off against the refund amount.</li>
            <li>The goods or products purchased from the site is/are not for resale for commercial purpose.</li>
            <li>MYZOO LTD. retains the discretion to cancel or withheld an order in case it finds, in its sole discretion, an order exceeds the amount that an individual would normally consume, and the same shall be applicable for the number of items ordered in a single order as well as putting several orders for the same goods or product.</li>
            <li>You must not use the site in any manner that may interrupt, damage or impair the contents or the site in any way, and must not take part in any action that could damage or possibly harm the site, its staff, officers, delegates, owners, or any other group or individual directly or indirectly involved with the site, or cause disruption or denial to access to the site. You acknowledge that all electronic messages or communications made by you to the site or app are done at your own instance and responsibility. You may only use the site for lawful purposes.</li>
          </Box>
        </li>

        <li>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "text.primary" }}>ORDER PLACING AND PROCESSING</Typography>
          <Box component="ol" sx={{ pl: 3, mt: 1 }}>
            <li>You shall place order/s according to the minimum order quantity mentioned on the site, if any.</li>
            <li>MYZOO LTD. customer care team shall monitor the status of an order through the master dashboard.</li>
            <li>You may choose to rate MYZOO LTD. for each individual transaction or order based on their performance, frequency and ratings after the order is marked as "DELIVERED".</li>
            <li>The dispatch forecasts on the site are estimated forecasts, and are not guaranteed delivery dates and cannot be seen as such. In case any of the items ordered is unavailable or inaccessible, the user will be notified via e-mail or SMS.</li>
          </Box>
        </li>

        <li>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "text.primary" }}>REFUND VOUCHER</Typography>
          <Box component="ol" sx={{ pl: 3, mt: 1 }}>
            <li>Refund vouchers issued by the site or MYZOO APP can be used on the site for making payment for purchases from the site or MYZOO APP, within a specified time, subject to further terms and conditions, within the specified time frame.</li>
            <li>Use of refund coupons obtained from another account will not be allowed.</li>
            <li>If a refund coupon fails, it may not be substituted.</li>
            <li>The refund voucher code can only be used once. The excess balance of the refund coupon, if any, will not be refunded and will not be usable for future orders, even if the order value is less than the remaining voucher value.</li>
          </Box>
        </li>

        <li>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "text.primary" }}>PROMOTIONAL VOUCHER</Typography>
          <Box component="ol" sx={{ pl: 3, mt: 1 }}>
            <li>Each promotional voucher (app/site voucher and new customer voucher) is only usable for one use per consumer.</li>
            <li>The user may not use more than one promotional voucher for the same transaction.</li>
            <li>Promotional voucher is non-refundable and cannot be redeemed for cash in whole or in part, and it is only available for one purchase at a time.</li>
            <li>Promotional voucher may only apply if the required sales price and other requirements are met.</li>
            <li>Voucher may not be available if used in combination with any other special offers.</li>
            <li>The Site retains the right to change or cancel promotional voucher scheme at any time and without any prior notification to the user.</li>
            <li>The Site shall not be liable for any financial loss arising out of the refusal, cancellation or withdrawal of any voucher or any failure or for your inability to use a voucher for any reason.</li>
            <li>If a voucher expires, it cannot be substituted by the site.</li>
            <li>You hereby warrant to the site/app that the voucher shall be used in good conscience and shall not be used fraudulently or in bad faith.</li>
            <li>MYZOO LTD. reserves the right to refuse or cancel any voucher/order if we have reasonable grounds to suspect that a voucher is being used unfairly or improperly. In such cases, the site or MYZOO APP retains the right to take appropriate action at its discretion.</li>
          </Box>
        </li>

        <li>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "text.primary" }}>PRODUCT PRICING AND PAYMENTS</Typography>
          <Box component="ol" sx={{ pl: 3, mt: 1 }}>
            <li>All product prices for will provide accurate details and breakdown of the price, including the delivery charges and the service charges if any applicable.</li>
            <li>All prices shall be in Bangladeshi Taka (BDT) and include VAT, and shall be specifically mentioned at the site. Price mentioned at checkout will always reflect the most recent price of the product. Price may vary when purchasing an item from when it was initially shown before adding the item to the cart. Adding an item to the cart does not guarantee the price that was displayed when choosing the item.</li>
            <li>If an item is mispriced, MYZOO LTD. may, at its discretion, correct it and would either contact the user to inform him/her about the new price or will cancel the order and inform the user.</li>
            <li>MYZOO LTD. reserves the right to reject or cancel all orders placed on the site. In the event that a prepaid order is cancelled, the site's refund policy will apply.</li>
            <li>MYZOO LTD. reserves the right to request validation of your payment details in order to prevent any credit or debit card fraud. This check or validation does not guarantee the prevention of fraudulent activity that may be carried out by third parties. MYZOO LTD. reserves the right to cancel an order immediately if it suspects an actual or potential dishonest use of banking instruments or for other purposes, without giving advance warning or incurring any legal liability.</li>
            <li>The mode of payment shall be cash on delivery or online payment or bank transfer or through credit facilities, as agreed between MYZOO LTD and you.</li>
            <li>That the price is subject to change time to time, at the discretion of MYZOO LTD., and the updated price displayed on the site shall be the final price.</li>
            <li>All payments for the orders shall be processed through the site's payment gateway. All financial transactions shall be processed by the site and transferred to the seller's account only after the goods received by the user are in satisfactory condition.</li>
          </Box>
        </li>

        <li>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "text.primary" }}>BREACH BY USER/S</Typography>
          <Box component="ol" sx={{ pl: 3, mt: 1 }}>
            <li>In the event of breach of the UUT&C, the site or MYZOO APP has the right to take actions as it deems fit, including but not limited to measures such as (i) suspending or terminating the user's account and any and all accounts found to be related to such account; (ii) restricting, downgrading, suspending or terminating the subscription of, access to, or the use of any of the service permanently or for such period deemed as appropriate by MYZOO LTD. (iii) removing any content posted by the user or imposing restrictions on the number of products listings or user content that the user may post; (iv) imposing any other restrictions on any features of any service on the site as MYZOO.asia may consider appropriate in its sole discretion; and (v) any other disciplinary or penalising actions as MYZOO LTD. may deem necessary or appropriate.</li>
            <li>Without limiting the generality of the term, a user would be considered as being in breach of the UT&C in the following circumstances:</li>
          </Box>
          <Box component="ol" sx={{ pl: 4, mt: 1 }}>
            <li>Upon receiving complaint, notification or claim from any third party, the site has reasonable grounds to believe that you have wilfully or materially failed to perform your obligation;</li>
            <li>The site has reasonable grounds to suspect that a user has used a stolen credit or debit card;</li>
            <li>The site has reason to believe that a user is providing false or misleading information in any transaction;</li>
            <li>The site has reasonable grounds to suspect that any information provided by the user is not up to date, complete, inaccurate or misleading; or</li>
            <li>The site has reasons to suspect that user's actions may cause financial loss or civil or criminal liability to MYZOO LTD., its affiliates, or any users.</li>
          </Box>
        </li>

        <li>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "text.primary" }}>SOFTWARE USE</Typography>
          <Box component="ol" sx={{ pl: 3, mt: 1 }}>
            <li>Any software (including any modifications or enhancements to the software, as well as any associated documentation) that we make available to you from time to time for use in conjunction with the site is referred to as "our software" (the "software").</li>
            <li>You can only use the site to allow you to use and enjoy our services in compliance with the UT&C and any other relevant terms as set out on the site. You cannot engage into any act or omission to cause interference with the software or the site or systems. You are not allowed to use the software and/or site in any way that is unlawful. We reserve the right to stop offering service to you and to revoke your right to use the site or software at any moment. All software used in operating the site are duly licensed or owned by MYZOO LTD., and is protected under the relevant laws of Bangladesh including but not limited to Copyright Act, 2000, Trademarks Act, 2009 and Patent Act 1911.</li>
            <li>You may be using the services of one or more third parties while you visit the site, i.e. cellular carrier or a mobile app operator, that have their own rules, terms of services, and costs that apply to such use.</li>
            <li>You are not allowed to allow, support, or permit someone else to copy, alter, reverse engineer, decompile or disassemble, or otherwise tamper with the software used to run the site, either in whole or in part, or produce any derivative works from the same.</li>
          </Box>
        </li>

        <li>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "text.primary" }}>Termination and Suspension of Account/s</Typography>
          <Box component="ol" sx={{ pl: 3, mt: 1 }}>
            <li>MYZOO LTD. retains the right to terminate or suspend (temporary/permanent) your account or revoke any or all of your rights granted under these UT&C, without giving advance notice to you.</li>
            <li>Upon termination of your account, you shall immediately cease all access to and use of the site. All passwords and account identification given to you will be revoked automatically, and you will be denied entry to and use of the site in full or in part. Any dissolution of this arrangement would have no effect on the parties' respective rights and responsibilities (including, though not limited to, payment obligations) occurring prior to the termination or suspension date. You further accept that the site or MYZOO APP would have no responsibility to you or anybody else as a result of any such suspension or termination. You agree that your only recourse, in case if you are unhappy with using the site or other terms, conditions, laws, procedures, guidelines, or processes required to use the site, is to stop using the site or MYZOO APP services.</li>
            <li>You must cooperate fully with government authorities and/or third parties in the event of any investigation of any suspected criminal or civil wrongdoing.</li>
            <li>To the extent permitted by the prevailing laws, the site may disclose the user's identity, contact information and/or any other information of the user' accounts, transactions logs or activities on the site, if requested by a government or law enforcement authority.</li>
            <li>By agreeing to these UT&Cs you agree to indemnify MYZOO LTD., its affiliates, sister concerns, directors, employees, agents and any authorized representatives and to hold them harmless, from any and all damages, losses, claims and liabilities including all legal costs which may arise from their breach of any terms, submission and/or any activities carried out by such user on the Site.</li>
          </Box>
        </li>

        <li>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "text.primary" }}>Intellectual Property Rights</Typography>
          <Box component="ol" sx={{ pl: 3, mt: 1 }}>
            <li>Through providing information for using the site, you grant an irrevocable, perpetual, worldwide, royalty-free and sub-licensable license to the site to display, transmit, disseminate, reproduce, publish, replicate, modify, translate, and otherwise use any and all of the user information or data in any form or media and for any purpose which may be beneficial to the operation of the site and for betterment of its service offering. You affirm and warrant that you have all the rights, power and necessary authority to grant the aforementioned license. The site/app shall use and preserve all data in accordance with the relevant laws in Bangladesh.</li>
            <li>You agree that you will not copy, reproduce, download, re-publish, sell, re-sell, distribute or disseminate any information, text, images, graphics, video clips, sound, directories, files, databases or listings etc. that is available on the site at all times.</li>
            <li>You agree that you will not copy, reproduce, replicate, download, compile or otherwise use any aspect of the site or its services for the purpose of operating a business that replicates or competes with MYZOO LTD. in violation of the rights and/or goodwill of MYZOO LTD.</li>
          </Box>
        </li>

        <li>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "text.primary" }}>Limitation of Liability</Typography>
          <Box component="ol" sx={{ pl: 3, mt: 1 }}>
            <li>You acknowledge and undertake that you are accessing the services on the site and transacting at your own risk and are using your best and prudent judgment before entering into any transactions through the site/app, i.e. MYZOO.ASIA/MYZOO, does not guarantee or take responsibility for any deceitful, misleading or fraudulent acts conducted by any user including you.</li>
            <li>You acknowledge that you are fully assuming the risks of conducting any purchase and/or sale transactions through the use of the site/app or its services, and that the risks of liability or harm of any kind in connection with or relating to products or services that are the subject of transactions on the site. Such risks shall include, but are not limited to, misrepresentation of products and services, fraudulent schemes, unsatisfactory quality, failure to meet specifications, defective or dangerous products, unlawful products, delay or default in delivery or payment, cost inaccuracies, breach of warranty and/or conditions, breach of contract and transportation accidents. Such risks also include the risks that the manufacture, importation, export, distribution, offer, display, purchase, sale and/or use of products offered or displayed on the Site may violate or may be alleged to violate third party rights, and the risk that you may incur costs of defence or other costs in connection with third parties' assertion of third-party rights. Such risks also include the risks that sellers, consumers, other Users, end-Users of products or others claiming to have suffered injuries or harms relating to products or from their use of such products originally obtained by You as a result of purchase and sale transactions on the Site.</li>
            <li>MYZOO LTD. shall not be liable for any breach of conditions, representations or warranties by the manufacturers or suppliers of the goods or products and hereby expressly disclaim any/all responsibility and liability in that regard.</li>
          </Box>
        </li>

        <li>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "text.primary" }}>Indemnity</Typography>
          <Box component="ol" sx={{ pl: 3, mt: 1 }}>
            <li>You shall indemnify MYZOO LTD., its affiliates and their respective officers, directors, agents and employees, from any claim or demand, or actions including reasonable attorney's fees, made by any third party or penalty imposed due to or arising out of your breach of these UT&C or any document incorporated by reference, or your violation of any law, rules, regulations or rights of third parties.</li>
            <li>You hereby expressly release MYZOO LTD, its affiliates and/or any of its officers and representatives from any cost, damage, liability or other consequence of any of the actions/inactions of any third party or other service providers and specifically waive any claims or demands that you may have in this regard.</li>
          </Box>
        </li>

        <li>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "text.primary" }}>Force Majeure</Typography>
          <Box component="ol" sx={{ pl: 3, mt: 1 }}>
            <li>Under no circumstances MYZOO LTD. shall be held liable for any delay or failure or disruption of the content or services delivered through the site resulting directly or indirectly from acts of God, forces or causes beyond our reasonable control of MYZOO LTD. including without limitation, internet failures, power cuts, disconnection of submarine cable, computer, telecommunications or any other equipment failures, electrical power failures, strikes, epidemic, pandemic, labour disputes, riots, insurgencies, civil disturbances, shortages of labour, fires, flood, storms, explosions, war and government actions or interventions.</li>
          </Box>
        </li>

        <li>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "text.primary" }}>Governing laws and jurisdiction</Typography>
          <Box component="ol" sx={{ pl: 3, mt: 1 }}>
            <li>The UT&C and the contract between you and MYZOO LTD. shall be governed, construed, interpreted, implemented, executed and performed in accordance with the laws of Bangladesh and you agree to submit to exclusive jurisdiction of the courts in Dhaka.</li>
          </Box>
        </li>

        <li>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "text.primary" }}>Dispute Resolution</Typography>
          <Box component="ol" sx={{ pl: 3, mt: 1 }}>
            <li>MYZOO LTD. encourages amicable settlement and may mediate in the event of any conflict/s that might arise between you and MYZOO LTD., which shall be resolved with the assistance or involvement of MYZOO LTD's Customer Support services. For addressing any grievances, or any transaction disputes you are encouraged to report the same to Customer Support here [INSERT LINK]. Upon failure to settle a dispute amicably within 30 days, such dispute shall be referred to MYZOO LTD's management Team.</li>
          </Box>
        </li>
      </Box>
    </Paper>
  </Container>
);

export default Terms;
