from typing import Any, Text, Dict, List

from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.events import SlotSet


# ---------------------------------------------------
# ACTION 1: Reset ESIC Slots (very important)
# ---------------------------------------------------

class ActionResetESICSlots(Action):

    def name(self) -> Text:
        return "action_reset_esic_slots"

    def run(
        self,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any],
    ) -> List[Dict[Text, Any]]:

        # Clear previous salary and employer_registered values
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

        salary = tracker.get_slot("salary")
        employer_registered = tracker.get_slot("employer_registered")
        lang = tracker.get_slot("lang")

        if salary is None or employer_registered is None:
            if lang == "hi":
                dispatcher.utter_message(
                    text="पात्रता जांचने के लिए मुझे सैलरी और नियोक्ता पंजीकरण की जानकारी चाहिए।"
                )
            else:
                dispatcher.utter_message(
                    text="I need both salary and employer registration details to check eligibility."
                )
            return []

        salary = float(salary)

        # Rule 1: Salary limit
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

        # Rule 2: Employer not registered
        if employer_registered is False:
            if lang == "hi":
                dispatcher.utter_message(
                    text="आप कानूनी रूप से ESIC के पात्र हैं, लेकिन आपका नियोक्ता पंजीकृत नहीं है। लाभ सक्रिय नहीं किए जा सकते।"
                )
            else:
                dispatcher.utter_message(
                    text="You are legally eligible for ESIC, but your employer is not registered. Benefits cannot be activated."
                )
            return []

        # Eligible case
        if lang == "hi":
            dispatcher.utter_message(
                text=
                "हाँ, आप ESIC के लिए पात्र हैं।\n\n"
                "आपको निम्न लाभ मिल सकते हैं:\n"
                "• आपके और आपके परिवार के लिए चिकित्सा सुविधा\n"
                "• बीमारी भत्ता (नकद सहायता)\n"
                "• मातृत्व लाभ\n"
                "• विकलांगता लाभ\n"
                "• मृत्यु की स्थिति में आश्रित लाभ\n"
                "• अंतिम संस्कार खर्च सहायता\n"
            )
        else:
            dispatcher.utter_message(
                text=
                "Yes, you are eligible for ESIC.\n\n"
                "Here are the benefits you can receive:\n"
                "• Medical treatment for you and your family\n"
                "• Sickness benefit (cash compensation)\n"
                "• Maternity benefit\n"
                "• Disability benefit\n"
                "• Dependent benefit in case of death\n"
                "• Funeral expenses coverage\n"
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
        lang = tracker.get_slot("lang")

        if basic_salary is None:
            if lang == "hi":
                dispatcher.utter_message(text="कृपया पहले अपनी बेसिक सैलरी दर्ज करें।")
            else:
                dispatcher.utter_message(text="Please provide your basic salary first.")
            return []

        basic_salary = float(basic_salary)

        employee = basic_salary * 0.12
        employer = basic_salary * 0.12
        total = employee + employer

        if lang == "hi":
            dispatcher.utter_message(
                text=
                f"आपका PF विवरण:\n"
                f"• बेसिक सैलरी: ₹{basic_salary:,.2f}\n"
                f"• कर्मचारी योगदान (12%): ₹{employee:,.2f}\n"
                f"• नियोक्ता योगदान (12%): ₹{employer:,.2f}\n"
                f"• कुल मासिक PF योगदान: ₹{total:,.2f}"
            )
        else:
            dispatcher.utter_message(
                text=
                f"Here is your PF breakdown:\n"
                f"• Basic Salary: ₹{basic_salary:,.2f}\n"
                f"• Employee Contribution (12%): ₹{employee:,.2f}\n"
                f"• Employer Contribution (12%): ₹{employer:,.2f}\n"
                f"• Total Monthly PF Contribution: ₹{total:,.2f}"
            )

        return []
    
    # ---------------------------------------------------
# ACTION 4: Reset PF Slot
# ---------------------------------------------------

class ActionResetPFSlot(Action):

    def name(self) -> Text:
        return "action_reset_pf_slot"

    def run(
        self,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any],
    ) -> List[Dict[Text, Any]]:

        return [SlotSet("basic_salary", None)]




class ActionResetGratuitySlots(Action):
    def name(self):
        return "action_reset_gratuity_slots"

    def run(self, dispatcher, tracker, domain):
        return [
            SlotSet("last_drawn_salary", None),
            SlotSet("years_of_service", None)
        ]
    


class ActionCalculateGratuity(Action):

    def name(self):
        return "action_calculate_gratuity"

    def run(self, dispatcher, tracker, domain):

        salary = tracker.get_slot("last_drawn_salary")
        years = tracker.get_slot("years_of_service")

        # Convert to float safely
        try:
            salary = float(salary)
            years = float(years)
        except:
            dispatcher.utter_message(text="Invalid input. Please enter numbers only.")
            return []

        # Check minimum 5 years
        if years < 5:
            dispatcher.utter_message(
                text="You are not eligible for gratuity. Minimum 5 years of service required."
            )
            return []

        #  Gratuity formula
        gratuity = (salary * 15 * years) / 26

        # Apply 20 lakh cap
        if gratuity > 2000000:
            gratuity = 2000000

        dispatcher.utter_message(
            text=f"Your gratuity amount is ₹{gratuity:,.2f}"
        )

        return []

 # -----------------------------------------
 # Detect Language Automatically -----------
 # -----------------------------------------

class ActionDetectLanguage(Action):

    def name(self):
        return "action_detect_language"
    def run(self, dispatcher, tracker, domain):
        text = tracker.latest_message.get("text")
        if any('\u0900' <= ch <= '\u097F' for ch in text):
            return [SlotSet("lang", "hi")]
        else:
            return [SlotSet("lang", "en")]