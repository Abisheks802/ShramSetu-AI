from typing import Any, Text, Dict, List

from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.events import SlotSet


# ---------------------------------------------------
# ACTION 1: Reset ESIC Slots
# ---------------------------------------------------

class ActionResetESICSlots(Action):

    def name(self) -> Text:
        return "action_reset_esic_slots"

    def run(self, dispatcher, tracker, domain):

        return [
            SlotSet("salary", None),
            SlotSet("employer_registered", None)
        ]


# ---------------------------------------------------
# ACTION 2: Check ESIC Eligibility
# ---------------------------------------------------

class ActionCheckESICEligibility(Action):

    def name(self) -> Text:
        return "action_check_esic_eligibility"

    def run(self, dispatcher, tracker, domain):

        salary = tracker.get_slot("salary") or "Not Provided"
        employer_registered = tracker.get_slot("employer_registered")
        lang = tracker.get_slot("lang")

        if salary is None or employer_registered is None:
            dispatcher.utter_message(
                text="I need both salary and employer registration details."
            )
            return []

        salary = float(salary)

        # Salary rule
        if salary > 21000:

            if lang == "hi":
                dispatcher.utter_message(
                    text="आप ESIC के लिए पात्र नहीं हैं क्योंकि आपकी सैलरी ₹21,000 से अधिक है।"
                )
            else:
                dispatcher.utter_message(
                    text="You are NOT eligible for ESIC because your salary exceeds ₹21,000."
                )

            return []

        # Employer not registered
        if employer_registered is False:

            if lang == "hi":
                dispatcher.utter_message(
                    text="आप ESIC के लिए पात्र हैं लेकिन आपका नियोक्ता पंजीकृत नहीं है।",
                    buttons=[
                        {
                            "title": "शिकायत पत्र बनाएं",
                            "payload": "/generate_complaint"
                        }
                    ]
                )
            else:
                dispatcher.utter_message(
                    text="You are eligible for ESIC but your employer is not registered.",
                    buttons=[
                        {
                            "title": "Generate Complaint Letter",
                            "payload": "/generate_complaint"
                        }
                    ]
                )

            return []

        # Fully eligible
        dispatcher.utter_message(
            text="You are eligible for ESIC and benefits can be activated."
        )

        return []


# ---------------------------------------------------
# ACTION 3: Calculate PF
# ---------------------------------------------------

class ActionCalculatePF(Action):

    def name(self):
        return "action_calculate_pf"

    def run(self, dispatcher, tracker, domain):

        basic_salary = tracker.get_slot("basic_salary")

        if basic_salary is None:
            dispatcher.utter_message(text="Please provide your basic salary.")
            return []

        basic_salary = float(basic_salary)

        employee = basic_salary * 0.12
        employer = basic_salary * 0.12
        total = employee + employer

        dispatcher.utter_message(
            text=
            f"Basic Salary: ₹{basic_salary}\n"
            f"Employee Contribution: ₹{employee}\n"
            f"Employer Contribution: ₹{employer}\n"
            f"Total PF: ₹{total}"
        )

        return []


# ---------------------------------------------------
# ACTION 4: Reset PF Slot
# ---------------------------------------------------

class ActionResetPFSlot(Action):

    def name(self) -> Text:
        return "action_reset_pf_slot"

    def run(self, dispatcher, tracker, domain):

        return [SlotSet("basic_salary", None)]


# ---------------------------------------------------
# GRATUITY RESET
# ---------------------------------------------------

class ActionResetGratuitySlots(Action):

    def name(self):
        return "action_reset_gratuity_slots"

    def run(self, dispatcher, tracker, domain):

        return [
            SlotSet("last_drawn_salary", None),
            SlotSet("years_of_service", None)
        ]


# ---------------------------------------------------
# GRATUITY CALCULATION
# ---------------------------------------------------

class ActionCalculateGratuity(Action):

    def name(self):
        return "action_calculate_gratuity"

    def run(self, dispatcher, tracker, domain):

        salary = float(tracker.get_slot("last_drawn_salary"))
        years = float(tracker.get_slot("years_of_service"))

        if years < 5:
            dispatcher.utter_message(
                text="Minimum 5 years service required for gratuity."
            )
            return []

        gratuity = (salary * 15 * years) / 26

        dispatcher.utter_message(
            text=f"Your gratuity amount is ₹{gratuity}"
        )

        return []


# ---------------------------------------------------
# LANGUAGE DETECTION
# ---------------------------------------------------

class ActionDetectLanguage(Action):

    def name(self):
        return "action_detect_language"

    def run(self, dispatcher, tracker, domain):

        text = tracker.latest_message.get("text")

        if any('\u0900' <= ch <= '\u097F' for ch in text):
            return [SlotSet("lang", "hi")]

        return [SlotSet("lang", "en")]


# ---------------------------------------------------
# COMPLAINT LETTER
# ---------------------------------------------------

 
class ActionGenerateComplaint(Action):

    def name(self):
        return "action_generate_complaint"

    def run(self, dispatcher, tracker, domain):

        name = tracker.get_slot("employee_name")
        company = tracker.get_slot("employer_details")
        joining = tracker.get_slot("joining_date")

        letter = f"""
To,
The Regional Director
Employees' State Insurance Corporation
Subject: Complaint Regarding Non-Registration Under ESIC
Respected Sir/Madam,
I, {name}, an employed at {company} since {joining}.
My monthly salary is within the ESIC wage ceiling.
Despite meeting eligibility criteria, my employer has not registered under ESIC.
Kindly investigate this matter.
Yours faithfully,
{name}
"""

        dispatcher.utter_message(text=letter)

        return []