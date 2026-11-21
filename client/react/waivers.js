// Waiver language shown on the registration Agreement step.
// Transcribed verbatim from client/files/DC Vault Waiver - Competition.pdf
// (pages 1-3: adult waiver, pages 4-6: youth waiver). The PDF's signature
// lines are omitted since the form collects the signature fields.
// If the PDF changes, update this file to match.

const waivers = {
  adult: {
    key: 'adult',
    tabTitle: 'Adult Athlete',
    tabSub: 'General Liability Waiver and Release',
    title: 'General Liability Waiver and Release',
    subtitle: null,
    sections: [
      {
        heading: null,
        paragraphs: [
          'In consideration of the opportunity provided by DC Vault LLC. (“DC VAULT”) to participate in its events, I hereby voluntarily state, represent and agree as follows:',
          'I am voluntarily entering or agreeing to participate in DC VAULT’s event(s), classes, or expo, as well as activities related thereto (collectively, the “Events”). I agree not to enter or participate in any of the Events unless I am healthy, medically able and properly trained and agree that it is my responsibility to consult with a physician prior to my participating in the Events to determine if I am medically able to participate in the Events. I agree to abide by any decision of an Event official relative to my ability to safely complete any Event.',
          'I recognize that participation in the Events is a potentially hazardous activity and I willingly assume all risks associated with such participation, including, but not limited to, falls; contact with other participants, spectators, or others, or vehicular or other traffic; the effects of the weather, including heat and/or humidity, wind, cold, and wet or slippery surfaces; physical injury from the act of running and vaulting itself; falling tree branches or other overhead objects; traffic.'
        ]
      },
      {
        heading: 'Liability Waiver and Release',
        paragraphs: [
          'Having read this Waiver/Release and knowing these facts, and in consideration of your acceptance of my application for the Event(s), I, for myself and anyone entitled to act on my behalf, do hereby waive, release, discharge, hold harmless, and covenant not to sue (a) DC Vault LLC.; U.S.A. Track & Field and its constituent associations; (b) all sponsors and officials of the Event(s); (c) the employees, and volunteers, including medical volunteers; and (d) all owners and lessors of premises on or in which any Event takes place, and other representatives, agents, and successors of each of the foregoing (the “Releasees”), from any and all present and future claims and liabilities of any kind, known or unknown, arising out of my participation in the Events, even though such claim or liability may arise out of negligence or fault on the part of any of the Releasees.',
          'I further acknowledge that the Releasees reserve the right to change the details (such as the date, start time, and location) of, and amenities offered at, the Events at any time for any reason, and I hereby waive and release any claims that I may have as a result of any such change.'
        ]
      },
      {
        heading: 'Medical Authorization',
        paragraphs: [
          'I grant the Releasees and their designees, , permission to administer or arrange for any medical assistance that they deem necessary or appropriate as a result of my participation in the Events, including without limitation, arranging transportation to a hospital or other medical facility. I also grant the Releasees access to my medical records and physicians, as well as other information, relating to medical care that may be administered to me at any such medical facility as a result of my participation in the Events.'
        ]
      },
      {
        heading: 'Publicity Release',
        paragraphs: [
          'I grant permission to DC VAULT to use, publish or license or authorize others to use, publish or license any photographs, motion pictures, video or sound recordings, and/or any other record of my participation in the Events, including, but not limited to portrait, picture, likeness, image and/or personal information, such as name, age, gender, domicile, race results, club affiliation, for any purpose without remuneration.'
        ]
      },
      {
        heading: 'Arbitration',
        paragraphs: [
          'I do hereby agree that any current or future controversy or claim between me and any of the Releasees (including their former, current, or future related affiliated entities) and/or between me and any of the Releasees’ former, current, or future partners or employees (in their institutional or personal capacities) (each a “Covered Person”) arising out of or relating to my participation in Events must be resolved by confidential, final and binding arbitration administered by JAMS, The Resolution Experts (“JAMS”), and conducted in accordance with the then-current JAMS Arbitration Rules & Procedures (the “Rules”) by a private and impartial arbitrator to be jointly selected by me and the Releasees from a list of neutral arbitrators provided by JAMS. I further agree that the arbitrator shall have the power to award any remedies, including attorneys’ fees and costs, available under applicable law, except punitive or exemplary damages. I acknowledge that judgment upon the award rendered by the arbitrator may be entered in any court having jurisdiction, and that the award may be vacated or modified only on the grounds specified in the Federal Arbitration Act or other applicable law. I understand that any arbitration conducted pursuant to this agreement shall take place in the District of Columbia.',
          'In agreeing to submit all disputes for resolution by arbitration, I acknowledge that such agreement is given in exchange for rights or benefits to which I am not otherwise entitled and the more expeditious and confidential resolution of any such disputes.'
        ]
      },
      {
        heading: 'Class / Collective Waiver',
        paragraphs: [
          'I hereby agree that all claims must be pursued on an individual basis only. By signing this agreement, I hereby waive my right to commence, or be a party to, any class or collective claims or to bring jointly any claim against the Releasees with any other person.'
        ]
      },
      {
        heading: 'Acknowledgment of Understanding',
        emphasis: true,
        paragraphs: [
          'I HAVE READ THIS WAIVER/RELEASE, AND I FULLY UNDERSTAND ITS TERMS AND CONDITIONS AND UNDERSTAND THAT I AM GIVING UP SUBSTANTIAL RIGHTS, INCLUDING MY RIGHT TO BRING ACTIONS AGAINST THE RELEASEES. I ACKNOWLEDGE THAT I AM SIGNING THE WAIVER/RELEASE FREELY AND VOLUNTARILY, AND THAT I INTEND BY MY SIGNATURE TO COMPLETELY AND UNCONDITIONALLY RELEASE THE RELEASEES TO THE FULLEST EXTENT ALLOWED BY LAW.',
          'I EXPRESSLY AGREE THAT THIS WAIVER/RELEASE IS INTENDED TO BE AS BROAD AND INCLUSIVE AS PERMITTED BY THE LAWS OF THE DISTRICT OF COLUMBIA AND THAT THIS WAIVER SHALL BE GOVERNED BY AND INTERPRETED BY THE LAWS OF THE DISTRICT OF COLUMBIA. I AGREE THAT IN THE EVENT THAT ANY CLAUSE OR PROVISION OF THIS WAIVER/RELEASE SHALL BE HELD TO BE INVALID, THE INVALIDITY OF SUCH CLAUSE OR PROVISION SHALL NOT OTHERWISE AFFECT THE REMAINING PROVISIONS OF THIS WAIVER/RELEASE, WHICH SHALL CONTINUE TO REMAIN IN FULL FORCE AND EFFECT.'
        ]
      }
    ]
  },

  youth: {
    key: 'youth',
    tabTitle: 'Youth Athlete',
    tabSub: 'Parent / legal guardian waiver',
    title: 'General Liability Waiver and Release',
    subtitle: 'Applicable to All YOUTH Participants in DC Vault Events & Activities',
    sections: [
      {
        heading: null,
        paragraphs: [
          'I, the legal guardian (“Guardian”) of ____________________ (“Participant”) agree that in consideration of the opportunity provided to Participant by DC Vault LLC (“DC Vault”) to participate in its events, I hereby voluntarily state, represent and agree as follows on behalf of Participant:',
          'Guardian hereby gives permission for the Participant to participate in the Events as defined herein. Participant is voluntarily entering or agreeing to participate in DC VAULT’s events, classes, expo, or other event(s), as well as activities related thereto (collectively, the “Events”). Guardian agrees not to enter or allow Participant to participate in any of the Events unless Participant is healthy, medically able and properly trained and agree that it is Guardian’s responsibility to consult with a physician, prior to Participant’s participation in the Events, to determine if Participant is medically able to participate in the Events. Guardian agrees to abide by any decision of an Event official relative to Participant’s ability to safely complete any Event.',
          'Guardian recognizes that participation in the Events is a potentially hazardous activity and Guardian willingly assumes all risks associated with such participation on behalf of Participant, including, but not limited to, falls; contact with other participants, spectators, or others, or vehicular or other traffic; the effects of the weather, including heat and/or humidity, wind, cold, and wet or slippery surfaces; physical injury from the act of running and vaulting itself; falling tree branches or other overhead objects; traffic.'
        ]
      },
      {
        heading: 'Liability Waiver and Release',
        paragraphs: [
          'Having read this Waiver/Release and knowing these facts, and in consideration of DC VAULT’s acceptance of Participant’s application for the Event(s), Guardian, for Participant, for him or herself and anyone entitled to act on Guardian’s behalf or Participant’s behalf hereby waives, releases, discharges, holds harmless, and covenants not to sue (a)DC Vault LLC; U.S.A. Track & Field and its constituent associations; (b) all sponsors and officials of the Event(s); (c) the employees, and volunteers, including medical volunteers; and (d) all owners and lessors of premises on or in which any Event takes place, and other representatives, agents, and successors of each of the foregoing (the “Releasees”), from any and all present and future claims and liabilities of any kind, known or unknown, arising out of Participant’s participation in the Events, even though such claim or liability may arise out of negligence or fault on the part of any of the Releasees.',
          'Guardian further acknowledges that the Releasees reserve the right to change the details (such as the date, start time, course, and distance) of, and amenities offered at, the Events at any time for any reason, and hereby waives and releases any claims that Participant may have as a result of any such change.'
        ]
      },
      {
        heading: 'Medical Authorization',
        paragraphs: [
          'Guardian grants the Releasees and their designees, permission to administer or arrange for any medical assistance that they deem necessary or appropriate as a result of Participant’s participation in the Events, including without limitation, arranging transportation to a hospital or other medical facility. Guardian also grants the Releasees access to Participant’s medical records and physicians, as well as other information, relating to medical care that may be administered to Participant at any such medical facility as a result of Participant’s participation in the Events.'
        ]
      },
      {
        heading: 'Publicity Release',
        paragraphs: [
          'Guardian grants permission to DC VAULT to use, publish or license or authorize others to use, publish or license any photographs, motion pictures, video or sound recordings, and/or any other record of Participant’s participation in the Events, including, but not limited to portrait, picture, likeness, image and/or personal information, such as name, age, gender, domicile, race results, club affiliation, for any purpose without remuneration.'
        ]
      },
      {
        heading: 'Arbitration',
        paragraphs: [
          'Guardian hereby agrees that any current or future controversy or claim between Participant and any of the Releasees (including their former, current, or future related affiliated entities) and/or between Participant and any of the Releasees’ former, current, or future partners or employees (in their institutional or personal capacities) (each a “Covered Person”) arising out of or relating to Participant’s participation in Events must be resolved by confidential, final and binding arbitration administered by JAMS, The Resolution Experts (“JAMS”), and conducted in accordance with the then-current JAMS Arbitration Rules & Procedures (the “Rules”) by a private and impartial arbitrator to be jointly selected by Guardian and the Releasees from a list of neutral arbitrators provided by JAMS. Guardian further agrees that the arbitrator shall have the power to award any remedies, including attorneys’ fees and costs, available under applicable law, except punitive or exemplary damages. Guardian acknowledges that judgment upon the award rendered by the arbitrator may be entered in any court having jurisdiction, and that the award may be vacated or modified only on the grounds specified in the Federal Arbitration Act or other applicable law. Guardian understands that any arbitration conducted pursuant to this agreement shall take place in the District of Columbia.',
          'In agreeing to submit all disputes for resolution by arbitration, Guardian acknowledges that such agreement is given in exchange for rights or benefits to which Participant is am not otherwise entitled and the more expeditious and confidential resolution of any such disputes.'
        ]
      },
      {
        heading: 'Class / Collective Waiver',
        paragraphs: [
          'Guardian hereby agrees that all claims must be pursued on an individual basis only. By signing this agreement, Guardian hereby waives Participant’s right to commence, or be a party to, any class or collective claims or to bring jointly any claim against the Releasees with any other person.'
        ]
      },
      {
        heading: 'Acknowledgment of Understanding',
        emphasis: true,
        paragraphs: [
          'GUARDIAN HAS READ THIS WAIVER/RELEASE, AND FULLY UNDERSTANDS ITS TERMS AND CONDITIONS AND UNDERSTANDS THAT GUARDIAN IS GIVING UP SUBSTANTIAL RIGHTS ON BEHALF OF PARTICIPANT, INCLUDING PARTICIPANT’S RIGHT TO BRING ACTIONS AGAINST THE RELEASEES. GUARDIAN ACKNOWLEDGES THAT GUARDIAN IS SIGNING THE WAIVER/RELEASE FREELY AND VOLUNTARILY, AND THAT GUARDIAN INTENDS BY HIS OR HER SIGNATURE TO COMPLETELY AND UNCONDITIONALLY RELEASE THE RELEASEES TO THE FULLEST EXTENT ALLOWED BY LAW.',
          'GUARDIAN EXPRESSLY AGREES THAT THIS WAIVER/RELEASE IS INTENDED TO BE AS BROAD AND INCLUSIVE AS PERMITTED BY THE LAWS OF THE DISTRICT OF COLUMBIA AND THAT THIS WAIVER SHALL BE GOVERNED BY AND INTERPRETED BY THE LAWS OF THE DISTRICT OF COLUMBIA. GUARDIAN AGREES THAT IN THE EVENT THAT ANY CLAUSE OR PROVISION OF THIS WAIVER/RELEASE SHALL BE HELD TO BE INVALID, THE INVALIDITY OF SUCH CLAUSE OR PROVISION SHALL NOT OTHERWISE AFFECT THE REMAINING PROVISIONS OF THIS WAIVER/RELEASE, WHICH SHALL CONTINUE TO REMAIN IN FULL FORCE AND EFFECT.'
        ]
      }
    ]
  }
}

export default waivers
