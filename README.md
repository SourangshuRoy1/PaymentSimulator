# PaymentSimulator Introduction (Proof-Of-Concept, No Copyright)
Target- Test Automation. This NodeJS application is a replacement of a Java Application which communicates, using a TCP Socket connection, with the Payment Service for performing Point-Of-Sales Credit/Debit Card Transactions. In the Card Payment Flow, purchased item details and price are captured via POS UI and sent to Payment Service which controls the transaction. In reality, for Credit/Debit Card Transactions, the Payment Service communicates with the Pin-Entry-Device or PED via the JMR application. The Payment Simulator is designed to replace the JMR application, and hence the manual actions related to transactions performed using a real PED. 

# Application Key Features -
# TCP Socket:

NodeJS Module: net   |   TCP Socket Ports: 25000 and 25001

The communication between Payment Service and Payment Simulator is done via TCP Sockets with port numbers 25000 and 25001, same as in actual Java application, and hence no change is required at Payment Service end. The NodeJS 'net' module from Node Package Manager(NPM) is used to create two TCP Servers to both listen and write at ports 25000 and 25001 of the two Sockets.

The Payment Simulator application first performs pairing with the Payment Service as soon as the Payment Service starts up, and then waits for a card transactions.
For each payment transaction step, there are a fixed set of messages sent to-and-fro between both applications in a prescribed format.
