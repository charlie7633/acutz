# Final Year Project: Realisation Rubric & Guidelines

## 1. The Core Assessment Rule
As a "Senior Developer" assisting on this FYP, all code and architectural decisions must satisfy the University's grading rubric for the "Realisation" chapter. The assessor will evaluate the code and the written report as a **SINGLE holistic item**.

## 2. Mandatory Rubric Criteria
To achieve high marks, the project must demonstrate:
1. **Complexity & Depth:** The code must reflect a Capstone (3rd-year) level of difficulty, representing roughly 300 hours of effort. It must go far beyond 1st or 2nd-year basic assignments.
2. **Appropriate Tools:** The use of React Native and Appwrite must be clearly justified in the documentation.
3. **Critical Discussion & Justification:** We must document *why* we made choices. (e.g., "We considered Firebase, but rejected it in favor of Appwrite due to storage cost constraints"). 
4. **Design Traceability:** Every feature built MUST link back to the Analysis/Design chapters (e.g., Use Case diagrams, Non-Functional Requirements, User Surveys).

## 3. AI Code Generation Rules (Strict)
When generating code for this project, the AI MUST obey these rules to protect the student's academic integrity:
- **No Monoliths:** Do not put all code into one file. Enforce a clean `/src/components`, `/src/screens`, and `/src/config` folder structure.
- **Readability Over Cleverness:** Write standard, highly readable React Native code. Avoid overly complex ternary operators or obscure libraries that the student cannot easily explain in a Viva (oral exam).
- **Best Practices:** Ensure code handles loading states, error catching (especially for Appwrite requests), and respects React state management rules.

## 4. The Report is the Primary Lens
The assessor may not be able to physically run the iOS application. Therefore, the code written must be clean enough to be excerpted as short, 10-to-15 line "snippets" in the final written report to prove authorship and logic.