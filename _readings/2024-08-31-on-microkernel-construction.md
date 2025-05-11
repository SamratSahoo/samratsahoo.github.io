---
layout: post
title: On Micro-Kernel Construction
description: A paper about microkernels
summary: microkernels
category: reading
tags: [research]
---

* Advantages of Microkernel:  
  * Modular System Structure  
  * Server malfunctions are isolated  
  * More flexible \+ tailorable; different strategies \+ APIs implemented can coexist  
* Assumptions \+ Requirements  
  * Support interactive, untrusted applications (deal w/protections)  
  * Page-based virtual memory scheme  
  * Subsystems implemented cannot be corrupted by other subsystems  
  * Secure communications channels between subsystems must exist   
* Micro-Kernel Concepts  
  * **Address Spaces:** A mapping which associates each virtual page to a physical page frame or marks it inaccessible  
    * Implemented by TLB \+ Page Tables  
    * Initially, there is one address space representing all of physical memory  
    * Create more address spaces → three operations  
      * Grant: Transfer ownership of page(s) from one space to another  
      * Map: Share ownership of page(s) with another space  
      * Flush: Remove ownership of page(s) from other spaces  
    * Memory management outside of kernel; Grant, Map, and Flush inside of Kernel  
      * Memory managers \+ pagers require Grant, Map, and Flush  
      * Can extend these operations to have more fine-grained operations  
  * **I/O**  
    * Address space is an abstraction for memory-mapped I/O  
    * Port-based I/O is also supported, but control depends on the processor  
    * Controlling I/O rights is done by memory managers \+ pagers  
  * **Threads and IPC**  
    * **Thread:** An activity executing inside an address space  
      * Has registers describing instruction pointer, stack pointer, state information, etc.  
      * Also includes information about its current address space  
        * Switching address spaces must be done by the Kernel (to avoid corruption)  
    * **Interprocess Communication (IPC):** cross-address-space communication (transferring messages across threads by the micro-kernel)  
      * Sender: decides to send info \+ its contents  
      * Receiver: decides if its willing to receive info \+ interprets it  
      * Remote Procedure Calls (RPC) is based on message based IPC  
    * **Supervised IPC:** Some architectures need to see memory \+ communication → done through communication channels  
      * Does not burden the micro-kernel  
    * **Interrupts:** Hardware is treated as a set of threads which sends empty messages with only a sender id   
      * Receiving threads determine if the message is an interrupt and which interrupt  
      * Transforming interrupts into messages done by kernel  
      * Interrupt handling not done in Kernel  
      * Kernel executes any required privileged instructions implicitly to release interrupt handlers (if needed)  
        * Drivers can usually do this on the user level  
    * **Unique Identifiers:** Micro-kernel provides unique ids for threads / tasks / communication channels for efficient local communication  
* Flexibility (Applications)  
  * **Memory Manager:** You can have co-existing memory managers managing different parts of the initial address space  
  * **Pager:** Can implement paged virtual memory or database mappings to address spaces using Grant, Map, Flush  
    * Can have multiple layers of pagers. User-supplied pagers can control user-level pages.   
  * **Multimedia Resource Allocation:** Need to be able to allocate memory with predictable execution times → can do this with user-level memory managers / pagers  
  * **Device Driver:** Accesses memory mapped I/O \+ reads hardware interrupts → similar to any other user-level process (nothing special required in micro-kernel)  
  * **Second-Level Cache \+ TLB:** Can be implemented with a pager which applies a cache dependent policy → usually as a user-level server  
  * **Remote Communication:** Implemented by communication servers that translate local messages to external protocols \+ vice versa. Uses communication drivers to access communication hardware. Can also implement a pager if sharing address space / buffers is required.   
  * **Unix Server:** Systems calls implemented as IPC. Server acts as pager \+ shares memory for communicating with all its clients  
  * **Limitations:** Cannot implement processor architecture, registers, first-level caches, first-level TLBs  
* **Performance, Facts, and Rumors**  
  * **Switching Overhead**  
    * **Kernel-User Switches:** Prior studies show that there is a non-trivial cost with switching  
      * Most of this is Kernel overhead in executing instructions or cache/TLB misses  
      * L3 Kernel minimizes this overhead using kernel stack / thread \+ persistent user processes  
        * Entering \+ leaving kernel mode can be a bit flip and costs can be internalized with kernel-specific registers for stack pointer, etc. → same as an indirect call \+ return  
      * TLDR: Switches are costly on some processors but can be improved 6 to 10 times with appropriate micro-kernel construction  
    * **Address Space Switches**  
      * Tagged TLBs: TLB includes address space id (and does not to be flushed) → no performance implications if the TLB can fit all the entries  
      * Untagged TLBs: Need to flush TLB entries \+ load new TLB entries → becomes critical especially if using fully TLB  
        * Processors use segment registers which offer additional address translation → no longer need TLB flush  
        * Other processors that don’t use segment registers \-- usually doesn’t matter because, in practice, memory used is usually small so switching between address spaces is fast. Costs of switching between larger areas is unavoidable (inherent to how memory works)  
      * TLDR: Properly constructed address space switches not expensive \+ Expensive context switches happen because of implementation  
    * **Thread Switches and IPC**  
      * RPC is fast and primarily influenced by processor architecture  
      * IPC can implemented to be fast (not an issue)  
  * **Memory Effects**  
    * When comparing Ultrix (monolithic kernel) and the Mach Micro-kernel, there was significant overhead with the memory cycle overhead per instruction  
    * This is primarily caused by increased cache misses for Mach  
      * Increased cache misses due to cache consumption by the system (Mach \+ Emulation Library \+ Unix Server)  
      * Cache consumption primarily caused due to micro-kernel → happens because of very frequently used micro-kernel operations from high working set operations used infrequently  
        * Large cache working sets not a feature of micro-kernel  
        * TLDR: Micro-kernel memory system degradation not substantiated →  properly constructed kernels avoid this  
* **Non-Portability**  
  * Portability allowed on *small hardware*\-dependent layer, independent of machine → resulting kernels could be ported to new machines  
    * Prevents performance gains \+ flexibility  
  * Issues:  
    * Micro-kernel can’t take advantage of hardware  
    * Cannot take precautions to avoid performance problems of specific hardware  
    * Additional layer \= higher costs  
  * Micro-kernels are hardware dependent  
  * **Compatible Processors (486 \+ Pentium)**  
    * **User Address Space Implementation:** Segment register works better on Pentium but traditional address translation works better on 486 → need to implement a user-address-space multiplexer for address space switching, IPC, etc.   
    * **IPC Implementation:** Restructure thread control block to align with smaller memory boundaries so that there is a lower probability two blocks will compete for the same spot in a cache  
      * Side effect of impacting UIDs → new system cannot fully replace old system  
  * **Incompatible Processors**  
    * Processors with different ISA, registers, exception handling, cache/TLB architecture, protection, and memory models will require different types of micro-kernels (i.e., hardware dependent)   
      * Micro-kernels form a link between the micro-kernel abstractions and bare processor  
* **Synthesis, Spin, DP-Mach, Panda, Cache, and Exo-Kernel**  
  * **Synthesis:** Had a kernel integrated compiler to generate kernel code at runtime → no longer works because of degraded cache performance  
  * **Spin:** User supplied algorithms are used (i.e., system calls) →  compiler ensures that kernel \+ user integrity is not violated  
    * Reduces kernel and address space switches  
    * Kernel performance may be impacted by larger kernel stacks \+ costs of safety guarantees result in micro-kernel overhead  
  * **Utah Mach:** Performance gains by changing Mach IPC to migrating RPC (thread migration between address spaces)  
  * **DP-Mach:** Multiple domains of protection within one user address space \+ protected inter-domain calls (specialized but still slower than RPC)  
  * **Panda:** Delegates as much as possible to user space using protection domain and virtual processor → kernel handles only interrupts and exceptions  
  * **Cache Kernel:** Caches kernels, threads, address spaces, mappings → never works with a complete set but rather a dynamically selected subset of address spaces  
  * **Exokernel:** Provides limited set of primitives to processes (instead of abstractions) and is architecture dependent. Partially integrates device drivers. 
