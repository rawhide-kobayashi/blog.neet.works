---
title: Benchmarking AVX-512 Video Encoding On Zen 5
description: Comparing the performance of x265 and SVT-AV1 with AVX-512 On/Off on a Ryzen 9 9950X, as well as against an Intel i7-14700F.
date: 2025-02-10T23:21:38.219Z
preview: ""
draft: true
tags:
    - AMD
    - AVX-512
    - intel
    - x265
    - svt-av1
categories:
    - benchmarking
    - video encoding
slug: benchmarking-avx-512-video-encoding-zen-5
keywords:
    - amd 9950x video encoding benchmark
    - amd svt-av1 benchmark
    - AVX-512 performance benchmarking
    - Best CPU for x265 and AV1 encoding
    - SVT-AV1 AVX-512 efficiency
    - SVT-AV1 encoding performance Zen 5
    - video encoding benchmark zen 5
    - x265 Zen 5 AVX-512 speedup
    - zen 5 avx 512 benchmark
    - Zen 5 AVX-512 impact
    - zen 5 avx512 benchmark
    - AMD Zen 5 video encoding benchmarks
---

## Some Background

The Zen 5 launch was largely considered, by Gamers™️, to be a disaster. There were accusations of AMD intentionally creating entirely false graphs, accusations of green-type greed for failing to cut >$100 off of the MSRP of brand-new SKUs to compete on value with older SKUs, and all other sorts of nonsense because Gamers™️ didn't get another ++30% generational performance uplift like between Zen 3 and Zen 4. AMD's marketing department should actually be hung out to dry for their multiple, high-profile, embarrassingly inaccurate and/or misleading graphs over the years, but that's neither here nor there. Shortly afterwards, Arrow Lake launched to raucus apathy, Zen 5 prices dropped to market value, and the 9800x3D became the best gaming CPU in the world. AMD are now Certified Good Guys once again.

The most outlandish claim AMD made at the time was the performance improvement in HandBrake.

{{< panzoom-gallery caption="Various charts claiming various performance improvements of Zen 5 CPUs compared to Raptor Lake Intel CPUs.">}}
    {{< panzoom-figure
        src="images/compressed/AMD 2024_Tech Day_David McAfee-05.webp"
        alt="Charts showing claimed performance improvements of the 9900x compared to the i9-14900k."
        gallery_class="grid-w50"
    >}}
    {{< panzoom-figure
        src="images/compressed/AMD 2024_Tech Day_David McAfee-06.webp"
        alt="Charts showing claimed performance improvements of the 9800x compared to the i7-14700k."
        gallery_class="grid-w50"
    >}}
    {{< panzoom-figure
        src="images/compressed/AMD 2024_Tech Day_David McAfee-07.webp"
        alt="Charts showing claimed performance improvements of the 9600x compared to the i5-14600k."
        gallery_class="grid-w100"
    >}}
{{< /panzoom-gallery >}}

Quite impressive, especially when comparing against SKUs with double-or-more core counts thanks to E-cores. What contrived circumstances did they pull to get a result like that? Six cores beating 6P+8E? It seemed ridiculous. The referenced end note card had these completely useless statements.

{{< panzoom-figure
    src="images/compressed/david-mcafee-21.webp"
    alt="Endnote card detailing the benchmark configurations from the above slides."
    caption="Endnote card detailing the benchmark configurations from the above slides."
>}}

No information about the video resolution, bit depth, encoding settings, encoder, or... Literally anything you might want to detail to prevent people from thinking you just made up a number. Just, "HandBrake." Thank you AMD, very cool! Some people accused them of accidentally using *hardware acceleration* while performing these benchmarks. Unfortunately, in this instance, this only serves to prove the accuser's own ignorance, as hardware accelerated encoding has *significantly* higher performance gains than 41-94%. Except...

## But, actually, AVX-512

Zen 5 *does* have an advantage that was ignored by the "muh value" glazers. From a certain point of view, you could actually call it hardware acceleration, but it's not in the way that the detractors were claiming at the time. Zen 5 brought full-fat, true 512-bit AVX-512 execution units and data paths. Four of them per core![^desktop_only]

AVX-512 is the 512-bit extension of the Advanced Vector Extensions instruction set, which is in the SIMD - Single Instruction, Multiple Data - family. It is an instruction designed to faciliate the simultaneous performance of mathematical operations on sets of numbers. Up to 512 bits' worth. You combine smaller sets of numbers - the **Vector** in Advanced Vector Extensions - and the CPU can then perform an operation on each number in that set, simultaneously, in a single clock cycle. With the four full-width AVX-512 execution units in every Zen 5 core, every CPU can (theoretically) do 2048 bits' worth of calculations, per core, per clock cycle. This is spherical cow in a vacuum territory, especially with the painful limitation of dual-channel memory, but on the 9950X, which has 16 cores, that means you could do operations on up to 1024[^quickmaths] 32-bit numbers simultaneously, on *every single clock cycle*.

For those who have not been keeping track of such things, AVX-512 has been a staple in Intel server SKUs since Skylake, but their consumer SKUs lacked it until Rocket Lake. Alder Lake introduced the asymmetrical P/E core paradigm on desktop SKUs, and it *launched* with AVX-512 - but only on the P-cores, which caused problems with then-current schedulers. They did not know how to deal with heterogenous instruction sets, and as a result, AVX-512 applications would crash when a thread moved to an E-core. Access to the instruction was eventually removed via microcode/BIOS updates, and then fused off physically on newer production runs. Intel has, as of this writing, yet to reintroduce AVX-512 to the consumer market, though it continues to bring meaningful performance benefits to their server platforms.

AMD lacked AVX-512 support for all their products until Zen 4, but when they did get there, they implemented it across their entire hardware stack. For Zen 4, rather than full 512-bit hardware, they had "double pumped" 256-bit hardware that took two clock cycles to complete an instruction rather than one. This has a number of beneficial implications in terms of power consumption, silicon area, and the ability to re-use existing 256-bit silicon for the AVX-512 execution units. It holds back the maximum possible performance, but when you're competing against Intel's *utter lack* of AVX-512 in consumer chips, that's an ♾️% advantage!

AVX instructions have a history of derision among consumers, particularly gamers and overclockers. AVX execution units need large areas of silicon, because they work on large amounts of data. Logically, per clock cycle, it will use more power, generate more heat, and do more work, because there are more transistors involved in executing the instructions. To make up for that, you will have to run fewer clock cycles per second to avoid overheating and excessive power draw that may cause voltge droop. There's a balancing act between clock speed and the accelerated overall speed of computation that AVX enables. Intel has historically maintained a very poor balance between those factors, leading to unstable overclocks, complaints about power consumption and thermals, and sometimes objectively reduced overall performance. It doesn't help that consumers are highly uneducated about thermal management, either. 100\*C is *fine*, but a gamer won't accept it.

As a result of Intel's inelegant handling of these requirements, AVX has garnered a bad rap in the general populace. The vast majority of applications are still compiled without AVX2, let alone AVX-512. Zen 4/5 desktop CPUs may have been bestsellers for a while now, but relative to the global population, very few people own CPUs with AVX-512 support. Some people are still out there using Core 2 Duos or other very, very low-spec Pentium/Atom chips that lack support for AVX2! In addition, most software isn't written in a hyper-optimized fashion that has inline assembly or AVX intrinsics, and compilers are not very good at auto-vectorizing code that was not written in a format that is intended to be vectorized. Consumers don't tend to process vast amounts of data that would benefit from the capabilities of AVX instructions anyway, right? So who really cares?!

Well, AMD does, and I'm glad that they do. There is one area where (relatively) average consumers need heavy compute, and that's video encoding. Hardware acceleration has gotten pretty good for casual use, especially for livestreaming. The energy efficiency and quality at low-latency is impossible for a software encoder to beat. However, if software is given the chance to stretch its legs latency/processing time-wise, the quality-per-bit, or compression efficiency, just can't be beat. Plus, hardware encoders, as fixed-function silicon, don't really get to keep up with new innovations in software design. AV1 may be fast if you use NVENC, but will it match the latest release of SVT-AV1-PSY at any given bitrate? Absolutely not. Besides, there are a variety of other operations in video processing that can benefit from (non-disastrously-downclocking) AVX-512 (provided the software was written correctly!) that are unrelated to the final encoding task.

Video encoding software like x265 and SVT-AV1, which are what I will be using for my test here, contain large quantities of hand-written assembly optimized for various SIMD instruction sets, including AVX-512. They exist regardless of the compiler flags used to build the software. Every build should be capable of using AVX-512 acceleration, and everyone should be able to reap the benefits without seeking out special builds of these pieces of software.

There are a litany of asterisks to go along with all that information, and I'm not an expert in assembly or CPU design. There's a much more detailed breakdown of Zen 5's AVX-512 over on [numberworld.org.](http://www.numberworld.org/blogs/2024_8_7_zen5_avx512_teardown/) Go ahead and give it a read if you're interested! Phoronix also has a [benchmark](https://www.phoronix.com/review/amd-epyc-9755-avx512) comparing the performance of a Zen 5 Turin server SKU with AVX-512 off, in double-pumped 256-bit mode, and full 512-bit mode in a variety of applications.

## Test Goals / Parameters

While AMD, for some indeterminable reason, did not make this obvious in their presentation, the gains in HandBrake could be attributed to the AVX-512 improvements present in Zen 5, and the continued efforts from video encoders to provide optimized AVX-512 code. HandBrake ships x265 as its HEVC encoder, and SVT-AV1 as its AV1 encoder, so those are what I will be testing here.

I have two goals with this test:
- Quantify the performance differences between a Zen 5 CPU with AVX-512 off, and on
- Quantify the performance differences between a Zen 5 CPU with AVX-512 on, and a Raptor Lake CPU

The first goal will implicate exactly how much the presence of AVX-512 could theoretically improve performance on Intel, should they adopt it. The second goal will determine to what degree AMD may have engaged in selective benchmarking tomfoolery in the earlier slides.

Most reviewers don't have any knowledge of encoders beyond extremely surface-level use of HandBrake or export options in video editing software. They just toss a file into HandBrake, pick something - hopefully it's consistent between tested products! - and hit go. Maybe they use the Phoronix Test Suite if they're a Linux shop, but that doesn't adequately cover the bases regarding A-B testing the impact of AVX-512 on performance on a single SKU. I waited six months and found zero reviews examining this specific topic to my satisfaction. Now, incidentally, I had reason to purchase a Zen 5 CPU, and decided to bench it for myself.

The tests are as simple as possible. There are far, far too many possible combinations of command line options to test within any kind of reasonable amount of time, and I don't think it's useful to test in that way. Most people just choose a built-in preset, maybe a `-tune` parameter, but that's the extent of their customization. I chose to perform a simple, like-for-like comparison of x265 and SVT-AV1. I used the three most common video resolutions - 720p, 1080p, and 4k - swept through every stock preset in x265 and SVT-AV1, under three different hardware configurations: Raptor Lake, Zen 5 AVX-512 Off, and Zen 5 AVX-512 On. I ran each configuration five times, and took the average of the combined wall-to-wall run times as my measurement. Then, I created graphs exhibiting the execution time improvements compared to the presumed slower configuration. They are available below, but there is more relevant information to get to before that.

By default, x265 does not enable AVX-512, even on supported systems, even if you do build it with relevant microarchitecture features enabled. You have to pass the parameter `asm=avx512` to enable it. HandBrake does *not* pass this parameter by default, either. You have to do it manually in the "Advanced Options" section. SVT-AV1 *does* enable AVX-512 by default, and for this test, I had to *limit* the featureset with the `asm=9`. This restricts SVT-AV1 to AVX2 and older features.

In addition to the run time, I also catalogged some other details like the average MHz and power draw as reported by turbostat, and reported average die temperature by sensors, but I didn't find the results very interesting (or accurate, in some cases) so they've been omitted from the below analysis. If you'd like to look at my test scripts and the raw data, you can do so at the repository below.

{{< gitea server="https://git.neet.works" repo="rawhide_k/zen-5-avx-512-encoding-benchmark">}}

## Systems Setup

For this test, I had two systems. One was based on the Ryzen 9 9950X, and the other on the Intel i7-14700F. Both systems have 2x32GB memory kits running at 6000MHz, though they aren't identical. Don't you worry, the slight variations on the timings are utterly irrelevant. Both systems ran identical software configurations - as identical as possible, at least, considering the architecture differences. They both ran Arch Linux with CachyOS optimized repositories - x86-64-v3 for the i7-14700F, and znver4 for the 9950X. The kernel version was `6.12.10-2-cachyos-lts`. Other relevant package versions were `ffmpeg 2:7.1-6.1`, `x265 4.0-1.1`, and `svt-av1 2.3.0-2`.

{{< panzoom-figure
    src="images/compressed/9950x.webp"
    alt="AMD Ryzen 9 9950X based test bench."
    caption="AMD Ryzen 9 9950X based test bench. The motherboard is an ASRock B650E PG Riptide Wi-Fi"
>}}

The 9950X had the socket power limit set to the stock 200w, and the current limit to the stock 160A. This is just about exactly what an NH-D15 can dissipate, when using a graphite thermal pad, as I did with this setup. Not great, not terrible, but it's what I had on hand. It didn't thermal throttle at stock settings, so that's good enough for me, for this test. The only options I changed regarding performance are memory related, enabling XMP and dropping vSOC to 1.1v. No PBO, no undervolting, stock fmax. 2000MHz fCLK and 3000MHz uCLK, as typical of 6000MHz memory.

{{< panzoom-figure
    src="images/compressed/14700f.webp"
    alt="Intel i7-14700F based test bench."
    caption="Intel i7-14700F based test bench."
>}}

The i7-14700F is a non-K SKU, so you can't overclock it. On some motherboards you can undervolt non-K SKUs, but not the one that I have. It's some kind of stripped down model ASUS uses for prebuilts. You can change the vdroop, which I have adjusted to whichever setting gave me optimal performance, but the differences were extremely minor, and that's really all you can do with it. I have the power/current limits technically uncapped, but the board has a hard current limit somewhere around 220-280w power draw, load type dependent. With a 240mm liquid cooler, temperature is not a concern. The only hardware-based limit on the performance is the motherboard's current limit.

Now you might say, "But Mr. Blogger! None of the slides earlier in the deck had a 9950X or an i7-14700F! This comparison is not fair, and you are a hack fraudster!" To which I would say... Yes, absolutely. It's not a fair comparison, and I'm not going to prove any of the aforementioned slides right or wrong. However, if you look at [this Phoronix benchmark](https://www.phoronix.com/review/intel-core-ultra-9-285k-linux/14), you can observe that there's not a huge difference between the 9900X and 9950X in SVT-AV1 and x265, nor between a selection of Raptor Lake chips. Scaling suffers greatly beyond twelve cores, even at 4k, unless you specifically invoke paralellism-enhancing commands that cause the compression efficiency to suffer. Chunking up a video and running multiple encode jobs to get the absolute maximum possible performance out of a given CPU with a given encoder with the best possible compression efficiency is a whole 'nother topic. By the way, the Phoronix Test Suite does *not* enable AVX-512 in x265. Their numbers would be much further apart between AMD and Intel if they did. Please feel free to email me if you have a desire to send me free hardware to conduct additional testing!

## Results!

For those with a short attention span, here's the gist.

- The 9950X demolishes the i7-14700F, as you would hope, with double the "P"-core count and AVX-512 present.
- AVX-512 gains are not significant with presets faster than "slow" with x265, or faster than "4" with SVT-AV1.
- SVT-AV1 benefits less from AVX-512 than I expected overall, given the fact it's newer and sees more consistent development.
- 4k brings out the biggest differences both in AVX-512 and between the processors in general, as expected.
- Faster presets and lower resolutions are more dependent on single core performance, with even worse scaling under the default conditions that SVT-AV1 and x265 operate under.

### Global Geomean

{{< panzoom-figure
    src="images/compressed/Geomean performance difference at major resolutions, across all presets.webp"
>}}

Geomean kinda sucks with the spread of values here. The superduperfast presets really bring the averages down, especially with x265. This graph is almost entirely useless. Read on for information on your specific preset and encoder of interest.

### 9950X vs 9950X, x265

{{< panzoom-gallery caption="Various charts detailing the uplift from enabling AVX-512 on the 9950X on the x265 encoder, from 720p to 4k.">}}
    {{< panzoom-figure
        src="images/compressed/9950X AVX-512 Off vs 9950X AVX-512 On, 720p, x265.webp"
        gallery_class="grid-w100"
    >}}
    {{< panzoom-figure
        src="images/compressed/9950X AVX-512 Off vs 9950X AVX-512 On, 1080p, x265.webp"
        gallery_class="grid-w100"
    >}}
    {{< panzoom-figure
        src="images/compressed/9950X AVX-512 Off vs 9950X AVX-512 On, 4k, x265.webp"
        gallery_class="grid-w100"
    >}}
{{< /panzoom-gallery >}}

We see significant performance gains here thanks to AVX-512, on the slow-placebo presets, across every tested resolution. The x265 documentation has not commented on AVX-512 since the version 2.8 release in May 2018... Where it said, "For 4K main10 high-quality encoding, we are seeing good gains; for other resolutions and presets, we don’t recommend using this setting for now."[^avxcomment] However, it seems that there are slight gains universally, increasing at 4k, but increasing greatly at every resolution as long as you use slow-placebo presets. I'd like to see the default behavior changed to enable AVX-512 by default, with a toggle to turn it off, in case you're running mixed workloads on older Intel servers with less well-behaved AVX downclocking.

### 9950X vs 9950X, SVT-AV1

{{< panzoom-gallery caption="Various charts detailing the uplift from enabling AVX-512 on the 9950X on the SVT-AV1 encoder, from 720p to 4k.">}}
    {{< panzoom-figure
        src="images/compressed/9950X AVX-512 Off vs 9950X AVX-512 On, 720p, SVT-AV1.webp"
    >}}
    {{< panzoom-figure
        src="images/compressed/9950X AVX-512 Off vs 9950X AVX-512 On, 1080p, SVT-AV1.webp"
    >}}
    {{< panzoom-figure
        src="images/compressed/9950X AVX-512 Off vs 9950X AVX-512 On, 4k, SVT-AV1.webp"
    >}}
{{< /panzoom-gallery >}}

SVT-AV1 has AVX-512 enabled by default, and the documentation makes no special note of it. These gains aren't all that great. I would have expected SVT-AV1 to have greater uplifts than x265, given it's newer, and under more active development - but, that could also be exactly *why* the gains are fewer - functions are still being actively worked on, and have not been finalized in a way that makes anyone want to commit to writing a fully-optimized assembly version of them. It could also be possible that SVT-AV1 is already approaching memory starvation without AVX-512, and you need more bandwidth to get additional gains. Either way, I'm not particularly fond of AV1 in general, and I'm not interested in going down any rabbit holes related to this result, unless someone feels like donating a Sapphire Rapids or Genoa (or newer) server. Or a Zen 4 threadripper system.

### i7-14700F vs 9950X, x265

{{< panzoom-gallery caption="Various charts detailing the uplift between the i7-14700F and the 9950X on the x265 encoder, from 720p to 4k.">}}
    {{< panzoom-figure
        src="images/compressed/i7-14700F vs 9950X AVX-512 On, 720p, x265.webp"
    >}}
    {{< panzoom-figure
        src="images/compressed/i7-14700F vs 9950X AVX-512 On, 1080p, x265.webp"
    >}}
    {{< panzoom-figure
        src="images/compressed/i7-14700F vs 9950X AVX-512 On, 4k, x265.webp"
    >}}
{{< /panzoom-gallery >}}

### i7-14700F vs 9950X, SVT-AV1

These are nice results. The AVX-512 gains from x265 really let the 9950X mog the poor i7-14700F (and by extension, i9-14900K, as the extra E-cores make almost zero difference). Keep in mind the i7-14700F is using ~260w throughout these tests, while the 9950X is capped to 200w. Pure performance aside - which is obviously significant - the efficiency improvement is also a huge win. Up to twice as fast, while using less power. What's not to like?

{{< panzoom-gallery caption="Various charts detailing the uplift between the i7-14700F and the 9950X on the SVT-AV1 encoder, from 720p to 4k.">}}
    {{< panzoom-figure
        src="images/compressed/i7-14700F vs 9950X AVX-512 On, 720p, SVT-AV1.webp"
    >}}
    {{< panzoom-figure
        src="images/compressed/i7-14700F vs 9950X AVX-512 On, 1080p, SVT-AV1.webp"
    >}}
    {{< panzoom-figure
        src="images/compressed/i7-14700F vs 9950X AVX-512 On, 4k, SVT-AV1.webp"
    >}}
{{< /panzoom-gallery >}}

Given the previous lack of significant uplift with SVT-AV1 due to AVX-512, it makes sense that these figures are much less impressive than x265. It's still a nice uplift, to be sure, but not as outstanding as 2x!

## Overall Conclusion?

Zen 5 carries a clear advantage over Raptor Lake, core for core. Gains attributed to the presence of AVX-512 can be great, or insignificant, depending on the encoder, the resolution, and the preset. For those interested in finding out more about the specific settings each preset contains that might be accelerated by AVX-512, you can find what features are enabled by specific presets in the [x265 documentation](https://x265.readthedocs.io/en/master/presets.html) and on the [SVT-AV1 GitLab.](https://gitlab.com/AOMediaCodec/SVT-AV1/-/blob/master/Docs/CommonQuestions.md#what-presets-do)

Did AMD lie? Maybe. I did two additional synthetic tests, not graphed here. I can very, very closely emulate the 9700X test, by just limiting the 9950X to a single chiplet, and using the i7-14700F as-is. Under the most favorable circumstances, the speedup was only 1.2x. Then, I emulated the i5-14600K/9600X graph, by limiting i7-14700F to 6P+8E, as well as limiting the 9950X to 6 cores on one chiplet. In that scenario, the speedup was 1.24x. A far cry from 41-94%. However, there are a number of differences between my setup and AMD's, apart from the inexact hardware.

- AMD tested on Windows. I tested on Linux. Windows' scheduler is famously terrible with assymetrical architectures. Could that have nerfed Intel enough to make up the difference?
- I only tested SVT-AV1 and x265. HandBrake also offers x264 for AVC, and libvpx for VP9. They could have tested with those, and gotten more disparate results.
- I'm using more recent versions of the encoders than HandBrake would have shipped when those graphs were made. There could be other improvements in the interim that have closed the gap.

I was not intending to do a strict DEBOONKING or affirmation of AMD's graphs in any case. They're just here as comparison, and they prompted my interest in examining AVX-512's presence in video encoders. I do not care enough to investigate the differences in encoders that I'm not interested in, so this story ends here, for now, at least.

[^desktop_only]: Zen 5 mobile and Zen 5c continue to use double-pumped/otherwise hybrid AVX-512 implementations. These claims are only accurate to the Granite Ridge chiplets used in desktop SKUs and some server SKUs. Presumably upcoming HX-type mobile SKUs as well, since they're just unpackaged desktop SKUs.

[^quickmaths]: 512 / 32 * 4 * 16

[^avxcomment]: https://x265.readthedocs.io/en/master/releasenotes.html#version-2-8