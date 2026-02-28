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

    def run(
        self,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any],
    ) -> List[Dict[Text, Any]]:

        salary = tracker.get_slot("salary")
        employer_registered = tracker.get_slot("employer_registered")

        # Safety check
        if salary is None or employer_registered is None:
            dispatcher.utter_message(
                text="I need both salary and employer registration details to check eligibility."
            )
            return []

        salary = float(salary)

        

        # ----------------------------
        # RULE 1: Wage Rule
        # ----------------------------
        if salary > 21000:
            dispatcher.utter_message(
                text="You are NOT eligible for ESIC because your salary exceeds ₹21,000."
            )
            return []

        # ----------------------------
        # RULE 4: Employer Registration
        # ----------------------------
        if employer_registered is False:
            dispatcher.utter_message(
                text="You are legally eligible for ESIC, but your employer is not registered. Benefits cannot be activated."
            )
            return []

        # ----------------------------
        # Eligible Case
        # ----------------------------
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

    def name(self) -> Text:
        return "action_calculate_pf"

    def run(
        self,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any],
    ) -> List[Dict[Text, Any]]:

        basic_salary = tracker.get_slot("basic_salary")

        # Safety check
        if basic_salary is None:
            dispatcher.utter_message(
                text="Invalid salary amount. Please enter a valid number."
            )
            return []

        basic_salary = float(basic_salary)

        employee_pf = basic_salary * 0.12
        employer_pf = basic_salary * 0.12
        total_pf = employee_pf + employer_pf

        dispatcher.utter_message(
            text=(
                f"Here is your PF breakdown:\n"
                f"• Basic Salary: ₹{basic_salary:,.2f}\n"
                f"• Employee Contribution (12%): ₹{employee_pf:,.2f}\n"
                f"• Employer Contribution (12%): ₹{employer_pf:,.2f}\n"
                f"• Total Monthly PF Contribution: ₹{total_pf:,.2f}"
            )
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