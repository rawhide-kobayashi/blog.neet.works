---
title: MaxCloudON PCIe Bifurcation Riser Review
description: My experience with the MaxCloudON PCIe Bifurcation Riser and a look at some alternatives.
date: 2025-01-19T07:32:31.512Z
preview: images/compressed/internal.webp
draft: false
tags:
    - nvidia
    - supermicro
    - pcie bifurcation
categories:
    - homelab
    - servers
    - reviews
slug: maxcloudon-pcie-bifurcation-riser-review
keywords:
    - Affordable PCIe bifurcation options
    - AliExpress PCIe bifurcation card
    - Best PCIe bifurcation riser for homelab
    - Best PCIe risers for GPU servers
    - Bifurcation riser for GPUs
    - Cost-effective GPU riser solutions
    - DIY GPU server build
    - GPU bifurcation riser setup
    - MaxCloudON PCIe bifurcation riser
    - MaxCloudON riser card review
    - Multi-GPU server setup
    - PCIe bifurcation
    - PCIe x16 to four x4 breakout
    - PCIe x16 to x4 riser
    - Reduce GPU slot blockage
---

## Overview
Following the implementation of my [whole-rack watercooling](https://blog.neet.works/posts/watercooling-homelab/) system in my homelab, astute viewers may have noticed that despite my proclaimed desire to use NVLINK, I still wasn't. I thought I had the hardware to connect the inlet/outlet ports on the GPU waterblocks with zero slots between them, but it turned out I didn't, and I didn't want to wait to get everything together for testing.

From the time I first acquired the GPUs, regardless of the watercooling plan, I'd wanted them to be attached to my main server. It's just more convenient to have everything in one place, and it allows me to turn the desktop off whenever it's not needed for CPU computer, which is the vast majority of the time. Unfortunately, GPU-focused servers and PCIe expansion boxes are not cheap, and they're very, very proprietary. My main server is in a Supermicro CSE-846 chassis, which accepts standard ATX/SSI-sized motherboards. The motherboard is a Supermicro X11DPH-T, which has 3x PCIe x16 slots, 4x PCIe x8 slots, and even two NVMe x4 slots on the board. Each is fully wired, so that's plenty of connectivity, but when it's all smooshed together with every slot adjacent, you're blocking off valuable connectivity by putting multi-slot cards like GPUs in there. It physically blocks a slot, and for my use case, they don't need access to the full bandwidth of a x16 or x8 slot either.

{{< panzoom-figure
    src="images/compressed/motherboard.webp"
    alt="My server motherboard, the Supermicro X11DPH-T."
    caption="My server motherboard, the Supermicro X11DPH-T."
>}}

Fortunately, modern server motherboards allow you to partition slots via PCIe bifurcation. This is commonly used for NVMe and U.2 riser cards, but you're not technically limited to using those types of devices. As long as you have the hardware to break out the electrical signals from a single slot into multiple physical slots, and somewhere you can mount the cards, you could use up to four GPUs via a single x16 slot! The crossbars for the radiator mount gave me a great place to mount them, so all I had to do was find the hardware to hook it all up... And here it is!

## Unboxing
[MaxCloudON](https://maxcloudon.com/ "#not an ad, but it could be 🪝☝️😜") is the only provider that I could find of a pre-packaged set of parts to fit such a need. You can find their [online store here](https://riser.maxcloudon.com/ "#not an ad, but it could be 🪝☝️😜"), based in Bulgaria, but they ship internationally. It seems apparent to me that they use this product for their own business renting GPU servers, and have also done us the courtesy of making it available for sale for the general public. I got [this specific set](https://riser.maxcloudon.com/en/bifurcated-risers/22-bifurcated-riser-x16-to-4x4-set.html "#not an ad, but it could be 🪝☝️😜"), available at time of writing for $165 USD, which comes with the hardware to break a single x16 slot out into four x4 slots. They also offer x8 to two x4, x16 to two x8, longer cables, and some other options along the same vein.

{{< panzoom-gallery caption="Everything was packed tightly together with plenty of bubble wrap, giving it very little space to move around, though only the riser card was in packed an ESD bag.">}}
    {{< panzoom-figure
    src="images/compressed/unbox_1.webp"
    alt="The box!"
    gallery_class="grid-w33"
    >}}
    {{< panzoom-figure
    src="images/compressed/unbox_2.webp"
    alt="Opening the box."
    gallery_class="grid-w33"
    >}}
    {{< panzoom-figure
    src="images/compressed/unbox_3.webp"
    alt="Removing the first layer of bubblewrap."
    gallery_class="grid-w33"
    >}}
    {{< panzoom-figure
    src="images/compressed/unbox_4.webp"
    alt="Removing two daughter boards and the PCIe card."
    gallery_class="grid-w33"
    >}}
    {{< panzoom-figure
    src="images/compressed/unbox_5.webp"
    alt="Removing cables and bubblewrap."
    gallery_class="grid-w33"
    >}}
    {{< panzoom-figure
    src="images/compressed/unbox_6.webp"
    alt="All items unveiled and splayed out in their glory."
    gallery_class="grid-w33"
    >}}
{{< /panzoom-gallery >}}

For your $165 USD, you get the PCIe breakout card with four SFF-8087 connectors, four purportedly special 60cm SFF-8087 cables, and four daughter boards with an SFF-8087 connector, a PCIe six-pin power input, and a physically x8 / electrically x4 PCIe slot with an open back. The bottom of the daughter board is coated in foam, and has pre-drilled holes in the PCB, so you can securely mount it to some surface if you wish. It's fairly thick and robust foam, but you might want to take care to add another insulating surface and/or avoid tightening it down too much if you mount it on something conductive, just in case.

{{< panzoom-gallery caption="My current setup with three GPUs connected. There's an Arc A380 and 2x 2080 Tis plugged into the daughter boards, powered by a separate PSU and hanging off of the crossbar for the watercooling radiator mount.">}}
    {{< panzoom-figure
    src="images/compressed/internal.webp"
    alt="Internal view of the bifurcation riser slotted in with all cables attached."
    gallery_class="grid-w35"
    >}}
    {{< panzoom-figure
    src="images/compressed/external.webp"
    alt="External view of three video cards plugged into riser boards and powered up."
    gallery_class="grid-w65"
    >}}
{{< /panzoom-gallery >}}

I'm no politician, so it's pretty hard to say anything else about this, other than, "it works." I mean, they're very basic PCBs, there's not much to go wrong as long as the PCIe signal integrity is fine. They didn't cheap out on the quality of the plugs, and everything just works. Good job MaxCloudON! I could only be happier if the cables were very slightly longer (for the same price plsthx 🙏) and if the daughter boards were slightly more narrow. You can't fit them side-by-side with two-slot cards, but I was able to use another riser cable I had on hand to bridge the gap without issue.

## Value & Comparisons
Alright, so, this would be a pretty short and boring post if I didn't explore any alternatives. It works, and that's great, but can you do better than $165 USD for a similar setup? Not to mention that I had to pay more than $40 USD for shipping to the US. Are five small circuit boards with barely a dozen parts on each, and a few cables really worth that much? Well, I couldn't find any other all-in-one solutions for this use case, so from a certain point of view, they could possibly charge even more. Perhaps jankier solutions aggregated from disparate providers could prove to work just as well, at a lower price? Let's take a look.

### OCuLink A
[This is a link to a product page](https://www.amazon.com/cablecc-SFF-8611-SFF-8612-External-Graphics/dp/B0BRV7RQLK) on Amazon that contains a variety of OCuLink adapters. OCuLink is a standard for PCIe signaling over cables. Using this page, let's create an equivalent kit.

- PCIe x16 to dual x8 OCuLink - $46 USD
- 50cm x8 OCuLink to dual x4 OCuLink cable - $50 USD * 2 = $100 USD
- OCuLink PCIe daughter board with x4 connector - $43 USD * 4 = $172 USD
- Total $318 USD

Not only is this setup twice the price in total, it has shorter cables, the daughter boards have 24 pin ATX power input instead of 6 pin PCIe, and the position of the OCuLink connector would be highly inconvenient in my setup. If you actually checked the product page, there is a good reason they use a 24 pin input - It's meant to be used as an eGPU dock for handheld PCs, so the daughter board includes hardware that will switch an external PSU on. It also includes an OCuLink cable and an NVMe to OCuLink adapter, which I couldn't use, since they only offer riser boards with x8 connectors... Even if there was a card with quad x4 OCuLink connectors, which isn't available here, the daughter boards alone are still more expensive than MaxCloudON.

### OCuLink B
Okay, but actually, quad x4 OCuLink cards do exist... [At least on AliExpress.](https://www.aliexpress.us/item/3256807963997657.html) This is not an endorsement. I haven't used it. It has a PCI bracket that it passes the connectors through, so that's neat. It looks nice. It seems that no product quite like this has made it to Amazon yet, and there are no worthwhile daughter boards on amazon either. So, what does the situation look like if we stick with AliExpress?

- PCIe x16 to quad x4 OCuLink - ~$16 USD
- [x4 OCuLink to PCIe with SATA power-in](https://www.aliexpress.us/item/3256806231527331.html) - ~$20 USD * 4 = $80 USD
- [1m x4 OCuLink cable](https://www.aliexpress.us/item/3256806120340421.html) - ~$14 USD * 4 = $56 USD

~$152... Still very, very close to the MaxCloudON price point, and with drawbacks. I can only find models that use 24 pin input, or SATA power input. 24 pin input has an added cost, as I don't have multiple 24 pin cable splitters on hand. In addition, theoretically, you can draw up to 75w through the PCIe slot, and the 12v power delivery on a 24 pin connector is only rated for 150w. Four daughter boards could exceed that rating. The same issue exists with the SATA input models. SATA connectors are only rated for 56w, and 75 is a bigger number than 56. SATA connectors are already infamous for melting under normal circumstances, driving low power devices like the hard drives they were explicitly designed to power. This situation is workable, but not ideal. With a price point so close to MaxCloudON, I'm not willing to risk the jank for maybe, maybe 20 bucks saved after getting the requisite splitters and non direct, not-daisy-chained SATA connectors.

### NVMe Risers?
U.2 bifurcation riser cards are fairly cheap, but I haven't been able to find any female U.2 to PCIe slot risers. NVMe bifurcation riser cards are also fairly cheap, and you can get NVMe to PCIe riser adapters, so let's compare the price there.

- PCIe x16 to quad NVMe - Anywhere from $15 USD to $60 USD, depending on the brand name.
- [50cm NVMe to PCIe riser](https://www.amazon.com/ADT-Link-PCI-Express-Right-Gen3-0-Extender/dp/B0BZVB3T3Y) - $34 USD * 4 = $136 USD

[ADTLink](https://www.amazon.com/stores/page/BC08F7B6-E667-478F-A595-8A83A40045AA "#not an ad, but it could be 🪝☝️😜") sells through Amazon in the US, and makes their products to order. They take a few weeks to ship, but I've ordered from them multiple times with great results. In terms of NVMe to PCIe risers, I'm not sure there are any worthwhile competitors... They're not even that much more costly compared to the competition, and being able to choose exactly which direction your cable comes off of the NVMe interface and the PCIe slot is a great feature for this type of product.

But, we're back again with the same issue as above: SATA power input, and the combined cost is still at minimum $151 USD. Plus, flat cables are more annoying to route, unless they're going straight up and out of the case, which is an option for sure, but not one that I prefer. 50cm is also a little bit short. You can get longer ones, but you need to directly contact them, and obviously it's going to cost even more. I used this type of riser to great effect when I was running the GPUs out of the prebuilt desktop before the watercooling project, but for this use case, I don't think they're a great choice either, unless you have an open-top or caseless build where you don't really have to do cable routing. Maybe, maybe then, it would be cheaper, as long as you're absolutely confident you won't burn up any SATA cables... Which you likely won't, and I didn't, but it's still not in spec. SATA cables love to burn up when you least expect it, so I prefer to avoid them as much as possible. That being said, you could swap them out for anything you want, but then we're adding cost again, and MaxCloudON looks better and better...

## Conclusion

{{< panzoom-figure
    src="images/compressed/nvtop.webp"
    alt="NVIDIA GPUs happily chugging away on a CUDA benchmark while the Intel GPU is also there. Arc cards do not have sensor/stat reporting on Linux before kernel 6.12..."
    caption="NVIDIA GPUs happily chugging away on a CUDA benchmark while the Intel GPU is also there. Arc cards do not have sensor/stat reporting on Linux before kernel 6.12..."
>}}

Alright, so there are setups that are nominally cheaper than MaxCloudON's package deals... With significant drawbacks in terms of violating power specifications, and janky, bulky connector splitters. You can call me privileged if you want, but I think if you can afford to spend a few hundred dollars each on multiple GPUs, and you have middle-aged enterprise hardware that has PCIe bifurcation, you can probably afford the slight premium to get a bundle from MaxCloudON, even if you have to pay for international shipping. Don't burn down your house to save 20 bucks on something like this. Personally, the international shipping, 6 pin board power, and convenience of getting one cohesive product from one supplier are definitely worth the slight upcharge from the other solutions I've proffered here. If you know of anything cheaper and less fire hazardy, especially if it has a nice PCI bracket, please send me an email and let me know so I can update this page.