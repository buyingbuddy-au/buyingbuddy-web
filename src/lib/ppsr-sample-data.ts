/** Three sample raw PPSR certificate texts for parser and PDF smoke tests. */

export const PPSR_SAMPLE_CLEAR = `
PPSR Certificate of Search
Personal Property Securities Register
Australian Financial Security Authority

Certificate Number: 2024-QLD-88341
Search Date: 15 January 2025
Search Reference: BUY-88341

---

VEHICLE DETAILS
VIN: JMFSNBY4W9J001234
Registration Number: 123ABC
State: Queensland
Make: Mazda
Model: Mazda3 Sedan
Year: 2019
Colour: White

---

SEARCH RESULTS SUMMARY

Finance / Security Interests: NONE FOUND
No current security interests are registered against this vehicle on the PPSR.

Stolen Vehicle Check: NOT REPORTED STOLEN
This vehicle has not been reported as stolen.

Write-Off History: NO WRITE-OFF RECORDED
No write-off or total loss record found for this vehicle.

Registration Status: CURRENTLY REGISTERED
Registration Expiry: 30 June 2025

---

This certificate confirms the results of a search of the PPSR conducted on 15 January 2025.
This search does not constitute financial or legal advice. For full details visit ppsr.gov.au.
Australian Financial Security Authority - afsa.gov.au
`;

export const PPSR_SAMPLE_FINANCE_OWING = `
PPSR Certificate of Search
Personal Property Securities Register
Australian Financial Security Authority

Certificate Number: 2024-NSW-54892
Search Date: 15 January 2025
Search Reference: BUY-54892

---

VEHICLE DETAILS
VIN: 6FPAAAJ3XER823456
Registration Number: XYZ987
State: New South Wales
Make: Toyota
Model: Yaris Cross
Year: 2021
Colour: Silver

---

SEARCH RESULTS SUMMARY

Finance / Security Interests: SECURITY INTEREST REGISTERED
A security interest is registered against this vehicle. Details below:

  Secured Party: ANZ Bank Ltd
  Collateral Type: Motor Vehicle
  Registration Number: 201905123456789
  Start Date: 12 March 2021
  End Date: 12 March 2026
  Description: Consumer motor vehicle finance - personal loan secured against vehicle

This means the vehicle may be used as collateral for a loan. If purchased without the finance being discharged, the lender may repossess the vehicle even after sale.

Stolen Vehicle Check: NOT REPORTED STOLEN
This vehicle has not been reported as stolen.

Write-Off History: NO WRITE-OFF RECORDED
No write-off or total loss record found for this vehicle.

Registration Status: CURRENTLY REGISTERED
Registration Expiry: 28 February 2025

---

IMPORTANT: A security interest is registered against this vehicle. Do not purchase this vehicle until you confirm with the seller that the finance has been fully discharged. Ask for written evidence from the lender.

This certificate confirms the results of a search of the PPSR conducted on 15 January 2025.
Australian Financial Security Authority - afsa.gov.au
`;

export const PPSR_SAMPLE_WRITEOFF = `
PPSR Certificate of Search
Personal Property Securities Register
Australian Financial Security Authority

Certificate Number: 2024-VIC-73310
Search Date: 15 January 2025
Search Reference: BUY-73310

---

VEHICLE DETAILS
VIN: WBA3X9C51FD567890
Registration Number: 1AB2CD
State: Victoria
Make: BMW
Model: 3 Series
Year: 2015
Colour: Black

---

SEARCH RESULTS SUMMARY

Finance / Security Interests: NONE FOUND
No current security interests are registered against this vehicle on the PPSR.

Stolen Vehicle Check: NOT REPORTED STOLEN
This vehicle has not been reported as stolen.

Write-Off History: WRITE-OFF RECORDED - REPAIRABLE WRITE-OFF
A repairable write-off record exists for this vehicle:

  Write-Off Type: Repairable Write-Off
  Date Recorded: 14 August 2022
  State of Origin: Victoria
  Insurer: IAG (NRMA Insurance)
  Reason: Significant collision damage - front and side impact

A repairable write-off means the vehicle was assessed by an insurer as having damage that could be repaired, but the repair cost exceeded a threshold. The vehicle may have been repaired and re-registered. Buyers should be aware of this history and arrange a thorough pre-purchase inspection.

Registration Status: CURRENTLY REGISTERED
Registration Expiry: 31 October 2025

---

IMPORTANT: This vehicle has a write-off history. We strongly recommend obtaining a full pre-purchase inspection from a qualified mechanic before purchasing. Negotiate the purchase price to reflect this history.

This certificate confirms the results of a search of the PPSR conducted on 15 January 2025.
Australian Financial Security Authority - afsa.gov.au
`;
