---
layout: post
title: Extensibility, Safety, and Performance in the SPIN Operating System
description: A paper about SPIN OS
summary: SPIN OS
category: reading
tags: [research]
---

* Exposes physical resource management to applications for their specific purposes → leads to significant performance improvements relative to monolithic Kernel  
  * Securely multiplexes hardware resources to untrusted application-level libraries (Library Operating Systems)  
  * Separates protection from management  
  * Protections Include:  
    * Secure Bindings: Apps bind to machine resources securely  
    * Resource Revocation: Apps participate in a resource revocation protocol  
    * Abort Protocol: Kernel can break bindings of uncooperative apps by force  
* **Motivation**  
  * Cost of Performance: Applications that do not need specific features are required to pay substantial overhead costs  
    * There is no way to abstract resources such that it works well for all applications (i.e., there are tradeoffs like sparse vs dense address spaces, read vs write intensive apps, etc.)  
  * Limited Functionality: Hide Information from applications which prevents apps from implementing their own abstractions  
  * Secure multiplexing of resources can be simply done through tables that track ownership  
  * Simple kernel allows it to easily adapt new requirements while being lightweight  
  * Library Operating Systems can be simpler and more specialized than Kernel implementations  
    * Library OS can also trust the application because Kernel does not need to trust the Library OS (i.e., only app impacted by malicious Library OS not exokernel)  
  * Kernel crossings are fewer because most of the OS runs in user address space  
  * Standard interfaces in OSes are easily portable   
  * An application can freely replace Library OS without special privledges  
  * Backward compatibility is possible through:  
    * Binary emulation of OS \+ application  
    * Implementation of hardware abstractions on exokernel  
    * Implementation of OS abstractions on exokernel  
* **Exokernel Design**  
  * **Design Principles**  
    * **Securely Expose Hardware:**   
      * Resources should be finely subdivided  
      * Exokernel should avoid resource management except when required for protection  
      * Export system calls that allow Library OSes to implement OS abstractions  
    * **Expose Allocation**  
      * Allow Library OSes to request for physical pages   
      * No implicit allocation should occur; Library OS should be involved in every allocation decision  
    * **Expose Names**  
      * Export physical names to avoid layers of indirection  
      * Should export book keeping data structures (i.e., freelists, TLB, disk arm positions, etc.) so apps can tailor requests based on resources  
    * **Expose Revocation**  
      * Allows well behaved Library OSes to perform efficient resource management and lets them choose which instance of a resource to relinquish  
  * **Policy**  
    * Exokernel needs to determine a policy to arbitrate competing Library OSes  
    * Can implement traditional resource partition strategies by granting or revoking access to resources   
  * **Secure Bindings**  
    * Decouples authorization from the actual use of the resource  
    * Protection checks expressed as simple kernel operations that can be done quickly  
    * Authorization only occurs at bind time → decouples management and protection  
    * When a resource is used, it can be accessed without needing to understand what is being accessed  
      * Bind Time: Understand \+ Authorize (setup rules)  
      * Access Time: Access \+ Protect (enforce rules)  
    * Secure bindings implemented through three mechanisms:  
      * Hardware Mechanisms: Secure bindings can be embedded as low level protection operations so accesses don’t need to check high-level authorization details everytime  
      * Software Caching: Used to cache frequently used secure bindings  
      * Downloading Application Code: Apps can provide code that kernels execute when a certain resource is accessed → reduces context switches \+ immediate execution of application code  
  * **Multiplexing Physical Memory**  
    * Exokernel creates a secure binding when a library OS allocates a physical memory page  
      * Exokernel will present access requests to library OS for security  
      * Exokernel uses TLB (either hardware or software) / page table to cache virtual to physical mappings  
    * Protecting resources directly → allows apps to grant access rights to other apps without exokernel  
    * Breaking a secure binding \= flushing the TLB mappings  
  * **Multiplexing Network**  
    * Packet filters allow the OS to demultiplex different network packets   
      * These are just secure bindings downloaded into the Kernel  
        * Kernel does protection checks to make sure it is safe  
      * It’s possible some packet filters can accept packets not belonging to them → use a central server install filters   
        * Not an issue on trusted systems  
    * CInan also use hardware mechanisms if available to demultiplex  
    * Outgoing messages → copy message from app to transmit buffer (and these can be mapped to application space)  
* **Downloading Code**  
  * Downloading code reduces kernel crossings  
  * Allows downloaded code to be executed even when not scheduled  
  * Application Safe Handlers: Process messages on reception → reduces latency because you don’t need to wait until a application is scheduled to process its packets  
* **Visible Resource Revocation**  
  * Invisible Revocation: OS allocates and deallocates physical memory without informing user → lower latency because no communication with app  
  * Visible Revocation: Informs apps about revocations → used by the exokernel  
  * **Revocation and Physical Naming**  
    * Relocation: Applications need to rename physical names in page tables, caches, etc. during deallocation  
    * When kernel deallocates, resource lists should be updated by the Library OS  
* **The Abort Protocol**  
  * Kernel needs to be able to take resources from Library OSes by force when Library OS doesn’t respond satisfactorily.  
    * Second stage of revocation where if certain constraint isn’t met to return resources, kernel forces revocation  
  * Repossession Vector: records when exokernel takes resource from library operating system  
    * Library OS gets repossession exception to remap resources  
    * Library OS can allocate some memory to record vital information → these pages are guaranteed not to be repossessed  
      * If these need to be repossessed, then Library OS will get a notification from kernel to use swap memory  
* **Aegis**  
  * Uses primitive operations to encapsulate privileged instructions \+ doesn’t alter application visible registers  
  * **Processor Time Slices:**  
    * CPU Allocation is done similar to how memory allocation is  
    * Round Robin styled time slots  
    * Compute heavy apps can schedule contiguous areas   
    * Position tells when the time slice will be run  
    * Uses timer interrupts to denote start and end of time slice  
    * Achieves fairness by bounding context-switching time  
  * **Processor Environments:**  
    * Four events delivered by Aegis  
      * Exception context: contains PC value \+ pointer to memory for saving registers when an exception occurs  
      * Interrupt context: PC values \+ register save region  
        * Timer interrupts: status register \+ start/end PC values  
      * Protected entry context: PC values for control transfers  
      * Addressing context: Guaranteed mappings of virtual to physical addresses → used for bootstrapping OS data structures.   
        * Also includes address space identifier, a status register, and a tag needed to switch environments  
  * **Exception Handling in Aegis**  
    * Step 1: Saves three scratch register in register save area  
    * Step 2: Load exception PC \+ cause of exception  
    * Step 3: Indirect jump to application-specific PC with appropriate permissions set  
    * All execution state must be saved in user accessible memory → allows user reconstruction  
  * **Address Translations**  
    * Aegis uses guaranteed mappings to allow application to easily allocate space for things like TLB, exception handlers, etc.  
    * Guaranteed Mappings segment application virtual address space into two parts:  
      * First segment \= normal application data \+ code  
    * On TLB miss:  
      * Step 1:  
        * If virtual address in first segment → exception to application  
        * If virtual address in second segment → if it is guaranteed mapping → installs the TLB entry and continues, else, forward to application  
      * Step 2:   
        * Application looks up virtual address in page table   
        * If access not allowed, raises exception  
        * Else constructs appropriate TLB entry  
      * Step 3:  
        * Checks if capability corresponds to access rights requested by application   
          * if it does mapping is installed in TLB and returns control  
          * Else throws an error  
      * Step 4: Applications clean up and resume execution  
  * **Protected Control Transfers**  
    * IPC Abstraction  
    * Changes the PC value to an agreed value in the callee and donated current time slice to the callee environment \+ installs callee’s processor context  
    * Synchronous: Donates current and all future instantiations of the time slice  
    * Asynchronous: Donates only the remainder of the current time slice  
    * Ensures atomicity \+ persistence of application visible registers  
  * **Dynamic Packet Filter**  
    * Dynamic Code Generation: Creation of executable code at runtime  
      * Allows DPF to eliminate interpretation overhead by compiling packet filters to executable at installation time  
      * Filter constants optimize the generated code  
* **ExOS**  
  * **IPC Abstractions**  
    * Uses the same protected control transfer mechanism used in Aegis  
    * Ultrix (monolithic OS) can only emulate apps on pre-existing abstractions so significantly slower than ExOS  
  * **Application level Virtual Memory**  
    * Limitations: No swapping and page tables are linear vectors (requires binary search to find translation)  
    * Flexible support for aliasing, sharing, disabling, per-page caching, specific page allocation, DMA  
  * **Application-Specific Safe Handlers**  
    * We cannot map network buffers to application space safely  
    * ASH allow you to run code when a context switch is impractical → decouples latency critical operations (i.e., message reply) from process scheduling  
    * ASH are untrusted → made safe through code inspection, sandboxing, and execution on arrival  
    * Four abilities of ASH  
      * Control where messages are copied in memory  
      * Dynamic integrated layer processing → integrate data manipulators (i.e., checksum) into data transfer engine  
      * Message initiation for low latency message replies  
      * Control initiation → can perform control operations at message reception time  
* **Extensibility with ExOS**  
  * **Extensible RPC**  
    * Implemented a version of LRPC that trusts the server to save and restore callee registers → Improved performance by a factor of 2  
  * **Extensible Page Table Structures**  
    * Inverted page tables → used in apps with sparse address spaces  
  * **Extensible Schedulers**  
    * Implemented stride scheduling → uses the proportion of time slice to determine which process to schedule