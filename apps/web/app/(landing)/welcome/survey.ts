// copy pasted from PostHog
import { USER_ROLES } from "@/utils/constants/user-roles";

export const survey = {
  questions: [
    {
      key: "features",
      type: "multiple_choice",
      question: "In welke functies ben je het meest geïnteresseerd?",
      choices: [
        "AI Persoonlijke Assistent",
        "Bulk Uitschrijven",
        "Koude E-mail Blocker",
        "Antwoord/Follow-up Tracker",
        "E-mail Analytics",
      ],
    },
    {
      key: "role",
      type: "single_choice",
      question: "Welke rol beschrijft jou het best?",
      choices: USER_ROLES.map((role) => role.value),
      skippable: true,
    },
    {
      key: "goal",
      type: "single_choice",
      question: "Wat wil je bereiken met Angri?",
      choices: [
        "Mijn huidige e-mails opschonen",
        "Mijn inbox beter beheren in de toekomst",
        "Beide",
      ],
    },
    // {
    //   key: "company_size",
    //   type: "single_choice",
    //   question: "What is the size of your company?",
    //   choices: [
    //     "Only me",
    //     "2-10 people",
    //     "11-100 people",
    //     "101-1000 people",
    //     "1000+ people",
    //   ],
    //   skippable: false,
    // },
    {
      key: "source",
      type: "single_choice",
      question: "Hoe heb je over Angri gehoord?",
      choices: [
        "Zoeken",
        "Vriend",
        "Twitter",
        "GitHub",
        "YouTube",
        "Reddit",
        "Facebook",
        "Nieuwsbrief",
        "Product Hunt",
        "HackerNews",
        "TikTok",
        "Instagram",
        "Anders",
      ],
      skippable: true,
    },
    {
      key: "improvements",
      type: "open",
      question:
        "Laatste vraag! Als je een toverstaf had, wat zou je dan willen verbeteren aan je e-mailervaring?",
    },
  ],
};
