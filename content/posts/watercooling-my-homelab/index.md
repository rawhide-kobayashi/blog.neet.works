---
title: Watercooling My Homelab
description: Watercooling for my homelab with a custom, leak-resistant controller and monitoring!
date: 2025-01-06T23:48:36.633Z
preview: /Supermicro_846_Internal.webp
draft: true
tags:
  - alphacool
  - arduino
  - intel
  - nvidia
  - supermicro
  - aqua computer
categories:
  - homelab
  - servers
  - watercooling
  - diy
---

## Overview
Watercooling - or, more accurately, custom loop watercooling[^badnomenclature], rather than AIOs - has increasingly transitioned to an aesthetic choice rather than a practical one in the consumer gaming space, with more energy efficient chips overclocked out the wazoo from the factory and relatively minimal gains to be made compared to cheaper and easier AIO solutions. However, there are still benefits to be had, marginal as they are, in performance, aesthetics, and longevity. In this post I'm going to showcase my solution for a leak-resistant watercooling system with monitoring that I trust to protect my beloved homelab from water damage as well as thermal throttling.

{{< panzoom-figure
    src="images/compressed/Triple_Card_Jank.webp"
    alt="My initial setup with 3x 2080 Tis, using m.2 NVMe to PCIe risers in an ASUS prebuilt. Two are connected by NVLINK, which I found to provide a slight performance benefit on the order of ~1-5% in multi-GPU SISR training, which is not worth the typical price for NVLINK bridges from this era. I was lucky to get this ugly, quadro-oriented bridge for just $40."
    caption="My initial setup with 3x 2080 Tis, using m.2 NVMe to PCIe risers in an ASUS prebuilt. Two are connected by NVLINK, which I found to provide a slight performance benefit on the order of ~1-5% in multi-GPU SISR training, which is not worth the typical price for NVLINK bridges from this era. I was lucky to get this ugly, quadro-oriented bridge for just $40."
>}}

I had wanted to watercool my ML setup for a while, particularly so I could use NVLINK without suffocating the GPUs. The above setup worked, but it was loud, the clock speeds were inconsistent, VRAM overclocking was very limited, they would bounce off the power/temperature limit, and it was an incredible pain to move whenever I had to poke around in there. Of course, I was concerned about the possibility of water damage. I've been doing custom watercooling since 2020 in my desktop, and I've never had a leak, but there were going to be more connected components than ever, with wider temperature swings, and collectively, a whole lot more expensive hardware that might get damaged than compared to my desktop setup. The situation became more dire to me, after I upgraded my main server and discovered that the forced-air passive chassis cooling was insufficient for my new CPUs.

So, how do you make a fluid system resistant to leaks? Build it very well, with close attention to detail, tighten all the fittings very carefully, regularly replace your o-rings and leak-check extensively before operation? No! You pull a vacuum inside the fluid loop! Just think about it. Water can't get out if air is trying to get in. It's so simple. I wish I could say that I came up with the concept myself, but I didn't. After finding out that Aqua Computer has a product called LEAKSHIELD which does exactly that, I finally had the confidence to take the plunge on this project.

{{< youtubeLite id="8UiRv0nDch0" >}}

## The Hardware
Most of the build uses pretty standard off-the-shelf parts for PC watercooling, but there are a few bits and pieces that most builders won't have seen before, and a couple custom solutions that provided a better experience than what standard PC parts can offer. The control system is 100% custom, based on an Arduino Uno that feeds vital statistics over serial, and features a custom pressure control system similar to the LEAKSHIELD, with PID fan control based on a set delta between the water and air temperature.

### Off-the-shelf
#### General Details

The centerpiece of the build, which the control unit and pump mount to, is the "MOther of all RAdiators", version 3, from Watercool. This is the 360mm version with support for up to 18 120mm fans, or eight 180mm fans. It's constructed more in the spirit of a vehicle radiator than a traditional PC radiator, with a less restrictive fin stack and large, round tubes rather than thin rectangular ones. It provides several mounting points for accessories which I was able to utilize to secure it to my server rack in a satisfactorily sturdy fashion. An in-depth teardown on the construction method and material quality of the MO-RA can be found on [igor'sLAB](https://www.igorslab.de/en/the-big-radiator-material-test-how-much-copper-and-technology-is-in-the-watercool-mo-ra3-360-pro-part-4/). For fans, I have a collection of old DC-control Corsair Air Series SP120s. They've all been retired from regular use, because of noise-related aging issues. In fact, one of them failed to turn at all once I had everything wired up, and another had its bearing disintegrate (and I really mean disintegrate, the fan became almost entirely un-born and would consistently ram into its own frame) about 8 weeks after putting the thing into service. That being said, they did survive (and continue to survive, in the remaining 16 cases) 24/7 use for anywhere from 4-10 years, at bottom of the barrel pricing, so that's not too bad. I'm not exactly pushing the limits of this radiator here, so a few fans breaking down over time isn't the end of the world.


{{< panzoom-figure
    src="images/compressed/MO-RA!.webp"
    alt="A MO-RA V3 360 PRO PC Watercooling Radiator from [Watercool](https://watercool.de)"
    caption="A MO-RA V3 360 PRO PC Watercooling Radiator from [Watercool](https://watercool.de)"
>}}

I got a secondhand Corsair XD5 pump/res combo from eBay for about sixty bucks, which is pretty good for a genuine D5-based pump/res combo. It has PWM support which I did wire up, but the flow rate ended up being so low at 100% that I just run it at 100% all the time. The flow rate is measured through an [Aqua Computer flow sensor](https://shop.aquacomputer.de/Monitoring-and-Controlling/Sensors/Flow-sensor-high-flow-LT-G1-4::3951.html), which is simply a hall-effect tachometer translated to l/h through software. I did not attempt to verify the accuracy of the sensor in my setup. The absolute accuracy is less relevant than simply getting an overall idea of whether or not the measurement is consistent with flow behavior, which it is.

{{< panzoom-figure
    src="images/compressed/Mounting_Detail.webp"
    alt="Simple, cheap aluminum bars and angles mount to the studs on the radiator and into the stud holes on the server rack, and the pump and control box mount onto brackets along with the fans."
    caption="Simple, cheap aluminum bars and angles mount to the studs on the radiator and into the stud holes on the server rack, and the pump and control box mount onto brackets along with the fans."
>}}

#### CPUs
My problematic upgrade was to dual Xeon Gold 6154s, which are Skylake-SP architecture. This specific SKU has 18 cores with sustained all-core speeds of 3.7GHz SSE / 3.3GHz AVX2 / 2.7GHz AVX512, and a TDP of 200 watts. The rated tjmax was 105C, and with the chassis cooling, they readily met that and started throttling under all-core loads, idling as high as 60-70\*C. I previously had Xeon e5-2697 v2s, which had TDPs of 130w. They got toasty, but never throttled. I'm not sure if the chassis had fan upgrades available that might have made a difference, and I certainly could have moved to 4u-compatible tower coolers rather than forced air, but I figured if I was going to cool the GPUs anyway, adding the CPUs as well would be minimal cost/effort, with more future compatibility for the waterblocks compared to a specialized LGA3647 tower cooler.

{{< panzoom-figure
    src="images/compressed/Coldplate.webp"
    alt="Alphacool Eisblock XPX Pro coldplate. Image credit & copyright - [igor'sLAB](https://www.igorslab.de/en/ryzen-threadripper-2990-wx-with-500-w-alphacool-iceblock-xpx-aurora-pro-plexi-digital-rgb-in-test/)"
    caption="Alphacool Eisblock XPX Pro coldplate Image credit & copyright - [igor'sLAB](https://www.igorslab.de/en/ryzen-threadripper-2990-wx-with-500-w-alphacool-iceblock-xpx-aurora-pro-plexi-digital-rgb-in-test/)"
>}}

The CPU waterblocks are Alphacool Eisblock XPX Pro Aurora Light models, which are significantly cheaper than the XPX Aurora Pro not-light version. They appear to be entirely identical, functionally... I'm not sure if there any actual performance benefits offered by the not-light version. It's a relatively obscure block family without many thorough reviews, which makes sense, given this block is designed for full coverage on Xeons/Threadrippers. The coldplate appears to be skived, which is uncommon in this price bracket for a discrete block, and the fins are incredibly short and dense. In smaller desktop loops, I've seen this block criticized for having overly restrictive flow, but when you have four blocks + quick disconnects, 'good' flow is relative.  At maximum load, the maximum core temperature delta relative to the water temperature is 25\*C, with a ~1-2\*C average delta between the two serially-connected sockets at a flow rate of ~130L/h, and that's more than sufficient.

{{< panzoom-figure
    src="images/compressed/Dual_Blocks_Zoom.webp"
    alt="Interior view of the Supermicro CSE-846 chassis showcasing the installed waterblocks and other components."
    caption="Interior view of the Supermicro CSE-846 chassis showcasing the installed waterblocks and other components."
>}}

#### GPUs

The GPU blocks are Phanteks 2080 Ti Founder's Edition blocks. Nothing special, they're just the cheapest matching ones I could find in 2024 that looked like they'd fit these almost-reference-but-not-quite OEM cards without extensive modification. I bought the GPUs from a supplier dedicated to the cause of specifically selling 22GB modded 2080 Tis, [for quite a reasonable price.](https://2080ti22g.com/ "#not an ad, but it could be 🪝☝️😜") It's by far the best value for $/GB VRAM in NVIDIA GPUs,[^pascalbad] although for your usecase, you will have to judge the speed-value proposition compared to used 3090 (Ti)s. Performance improvements in ML tasks between the 2080 Ti and 3090 (Ti) ranges from as little as ~20% to as much as ~100% depending on how memory bandwidth constrained your workload is. With secondhand 3090 (Ti)s still going for minimum $700 on the used market in the US, I found the alternative 2080 Ti option to be more alluring. The idea of having a modded GPU in itself was also appealing and definitely part of why I made that decision. Pulling up a hardware monitor and seeing a 2080 Ti with 22GB of VRAM  feels a little bit naughty, and I like that. I did initially buy three of them, as pictured above, but one of them failed just after the 30 day warranty period listed on their website. Despite that, they were kind enough to offer a full refund if I covered return shipping, and were very communicative and responded in <24 hours every time I sent them any kind of message/inquiry.

{{< panzoom-figure
    src="images/compressed/GPUs_Installed.webp"
    alt="The blocks installed in an ASUS prebuilt gaming tower."
    caption="The blocks installed in an ASUS prebuilt gaming tower."
>}}

With the stock air cooler, I couldn't maintain 1800MHz core clock without alternatively power/thermal throttling. 1800MHz is a somewhat arbitrary choice of clock speed that is technically overclocked from the 2080 Ti base, but still reasonably power efficient. The actual temperature is not a concern, in terms of longevity, despite what some/many/most people seem to believe. It does have a direct impact on performance, but most people are not suffering thermal throttling to the degree that their performance is affected in a way that they would actually notice in a blind test.

The biggest benefit that watercooling brings to modern video cards is a prolonged lifespan. Not due to lower core temperatures, in an absolute sense, but due to the reduced stress from thermal cycles. Mismatches in the rate of thermal expansion between the die and the substrate will eventually cause their bond to break, and this happens faster the larger your die is. Today's GPU dies are huge, and this failure mode is the most common.

Logically, provided you don't somehow break things while installing the block, watercooling is the second-best method to ensure the longevity of your GPU behind never using it, or always keeping it under full load. It also generally allows the memory to clock a bit higher as it can be kept significantly cooler by the less-heat-saturated surface area of the block compared to a traditional air cooler. Although I can't benchmark the before and after memory temperature on these cards in particular as they do not expose VRAM temperature sensors, I can confirm that putting them under water allowed the memory to clock marginally higher than under the stock air cooler.

{{< panzoom-gallery caption="The GPU blocks required a *moderate amount of light massaging* to properly fit on these OEM model cards. The power plugs are in a different position and a singular capacitor on these models is slightly taller than on the actual Founder's Edition reference card, but they're otherwise identical. Enough.">}}
    {{< panzoom-figure
    src="images/compressed/Block_Mod_Detail_A.webp"
    alt="Trimmed area for the capacitor."
    gallery_class="grid-w25"
    >}}{{< panzoom-figure
    src="images/compressed/Block_Mod_Detail_B.webp"
    alt="An area of the block cut out to make room for the power plugs."
    gallery_class="grid-w25"
    >}}
    {{< panzoom-figure
    src="images/compressed/Tall_Capacitor.webp"
    alt="Showcasing the capacitor fitting into the trimmed area."
    gallery_class="grid-w50"
    >}}
    {{< panzoom-figure
    src="images/compressed/Different_Plugs.webp"
    alt="Showcasing the plugs fitting into the cutout area."
    gallery_class="grid-w50"
    >}}
{{< /panzoom-gallery >}}

Temperature, as an absolute value, within manufacturer limits, affects boost clocks, and leakage current. A cooler chip will use less power to run at the same clock speed compared to a hotter chip due to reduced leakage current, making them measurably more energy efficient per clock cycle the colder they run. Quantifying the exact drop in power use due to reduced leakage current is not possible as I do not have an isolated measurement of how much power the fan used, which draws from the total board power budget. In my case, with the fan on max, while not thermal throttling, these GPUs would bounce off the power limit of 280w while attempting to hit a core clock of 1800MHz. Under water, at a measured core temperature of ~30*C, the reported board power draw is only ~220w at 1800MHz core clock for the same workload. The type of fan typically found in these coolers is rated anywhere from 15-30w on its own.

### Putting the I in DIY

In no particular order, here is a list of the major components involved in the control system.
- Generic metal box, that used to contain backup batteries for a PBX system.
- Arduino Uno clone, unknown brand
- 60mm Corsair fan
- RS232 TTL shifter
- Aesthetic retro power switch
- 12v DC vacuum pump
- U.S. Solid 12V NC Solenoid
- 12v relay modules
- HX711 ADC
- MD-PS002 Absolute Pressure Sensors
- L298-like PWM motor driver
- Apple White iMac PSU
- Adafruit Arduino Uno Proto Shield
- DS18B20 temperature probes

{{< panzoom-figure
    src="images/compressed/Test_Fit.webp"
    alt="Plopping all the major components in a box to see what happens in my brain."
    caption="Plopping all the major components in a box to see what happens in my brain."
>}}


Unfortunately, I didn't take excruciatingly detailed pictures of literally every single step of the assembly/prototyping process, but it's not that complicated or interesting in terms of electrical engineering. For the most part, it's just plugging pre-made components together. The most interesting production notes include the pressure sensor and the power supply.

#### Putting New Life into an iMac PSU

Some time ago, my aunt gave me her first-gen Intel White iMac, which is visually very similar to the G5, and it was one of the earliest things that I installed Linux on. I used it as a seedbox for a bit, but eventually took it apart and saved some of the more interesting stuff. The hard drive is still running in my router today!

{{< panzoom-figure
    src="schematic_minify.svg"
    alt="My schematic for the control unit. It's the first time I've used KiCad, and the first time I've ever made a schematic like this at all. I hope it's relatively legible."
    caption="My schematic for the control unit. It's the first time I've used KiCad, and the first time I've ever made a schematic like this at all. I hope it's relatively legible."
>}}

All the credit goes to the user 'ersterhernd', from [this thread](https://www.tonymacx86.com/threads/imac-isight-model-power-supply-unleashed.150793/) on the [tonymacx86.com](https://tonymacx86.com) forum for figuring out the pinout of this PSU, which is almost entirely identical to the one that was in my unit, apart from the power rating on mine being 200w. There are two banks of pins, half of which are always on, half of which are toggleable. Each bank has 12v, 5v, and 3.3v. I didn't end up using 3.3v for anything other than the power switch. I have no idea what the energy efficiency of this unit is, obviously it doesn't have an 80+ certification... But I'm assuming that Apple would make it at least halfway decent, right? Certainly more than a random 12v power brick with additional converters, I'd hope.

As you can see in the schematic above, the always-on 3.3v pin is connected to SYS_POWERUP through a relay board. The relay input is pulled low by a single pole switch, which turns the relay on, which connects ground to SYS_POWERUP, engaging the other rail of the power supply. This is kind of a convoluted solution to not having a double-pole switch... But I didn't have a double-pole switch, so that's what I did.

While I did wire up the pump PWM, tachometer, and fan tachometer, I didn't really end up using them. There's no reason for the pump to ever run below 100%, especially given the restrictive loop, and the tachometer readings I found to be very inconsistent for all but the flow meter. I still haven't figured out for sure what the problem is. My best guess is that the PWM signal for the fans is interfering with the readings for those two pins, somehow... But I'm not sure. In the end, I took fan tachometer monitoring out of the script entirely, as the flow meter will inform of pump failure, and air vs water temperature deltas will inform of total fan failure. I haven't integrated monitoring into the server-side of the script yet, beyond simple stat readouts. I plan to integrate it with Zabbix, once I have that installed... Soon™️.

#### Measuring vacuum

The leak-resisting aspect all hinges on monitoring the pressure of the loop. For some reason, I had a really hard time finding a vacuum pressur sensor. There are plenty of physical, analogue vacuum gauges available, but an actual, electronic sensor... At least for reasonable prices, located in the US, I could only find ones that measured positive pressure. Maybe I had the wrong search terms. Eventually I found an unpackaged sensor with obscure, not entirely legible datasheets that claimed to have an acceptable pressure range for my application. The [MD-PS002](https://electronperdido.com/wp-content/uploads/2021/12/MD_PS002-Datasheet.zh-CN.en_.pdf) is what I settled on, available on Amazon in the US in a 2-pack for $8. It's a tiny little thing, and it took two attempts to successfully create a sensor package that didn't leak.

{{< panzoom-gallery caption="Sensor package details, installed and all gooped up.">}}
    {{< panzoom-figure
    src="images/compressed/plug_detail_top.webp"
    alt="Top view of the sensor JB Welded into the drilled out plug."
    gallery_class="grid-w50"
    >}}{{< panzoom-figure
    src="images/compressed/plug_detail_bottom.webp"
    alt="Bottom view of the sensor JB Welded into the drilled out plug."
    gallery_class="grid-w50"
    >}}
    {{< panzoom-figure
    src="images/compressed/goopy_installed.webp"
    alt="Sensor package with additional JB Weld installed into the vacuum tank."
    gallery_class="grid-w100"
    >}}
{{< /panzoom-gallery >}}

I drilled a hole in a G1/4" plug, just slightly bigger than the metal ring on the sensor, coated that ring with J-B Weld, and inserted it, letting it cure before grinding away the exterior of the top of the plug and building up more J-B weld to add some strain relief for the wires as well as edge-to-edge sealing. The vacuum loss rate, after running the system for a few months to allow the loop to thoroughly de-gas, is now less than 50mbar per day at -500 to -600mbar. I was slightly worried about the lifetime of the pump, given it's a cheap thing from Amazon, but given it only has to run for about a second every other day, I imagine that won't be an issue.

This sensor is a wheatstone bridge, which works the same way as load cells for digital scales. The resistance changes are very, very low, thus the signal must be amplified before being fed into an ADC. You could use an op-amp, and feed that signal into an analog input on the Arduino, but I felt more comfortable using the HX711, a two-channel ADC with integrated amplifier designed to be used with wheatstone bridge load cells. Here's a code snippet showing how I converted the raw analog measurement to mbar.

```c++
float pressure_raw_to_mbar(int32_t pressure_raw) {
  return (pressure_raw - 390000) * (1700.0 / (5600000 - 390000)) - 700;
}
```

I calibrated it manually, comparing it to an analogue gauge. It's calibrated to a zero point at atmospheric pressure in my locale, and from -700mbar to +1000mbar. I figured out that, when setting the HX711 to a gain of 64 with the Adafruit HX711 library, a change of 100mbar is a change in the ADC measurement by 30k, highly consistent across the entire pressure range that I tested. I can't be 100% sure how accurate the analogue gauge is, but 100% accuracy doesn't really matter for this application. All I really need to know is the fact that an adequate vacuum is present, and a general idea of the leak rate, which is a requirement that this setup meets.

#### Other stuff

Everything else was mostly uneventful. I got a medium-power PWM motor driver with L298 logic, claiming a continuous current of 7 amps per channel, which nicely fit my requirements. 120mm PC fans are typically 0.2-0.3 amps, mine in particular are 0.25. So, for 18 fans, it should be approximately 4.5 amps at 100% speed. It's a bit oversized, and I'm only using one channel, but it leaves me the option in the future to use larger, generic radiator fans that have more demanding power requirements. PC fans are infamously overpriced, after all. Eventually enough of them are going to fail that I'll have to do something.

{{< panzoom-gallery caption="Required additions to the solenoid, pump motor, and the complete assembly without cover.">}}
    {{< panzoom-figure
    src="images/compressed/pump_greeble.webp"
    alt="Top view of the sensor JB Welded into the drilled out plug."
    gallery_class="grid-w45"
    >}}
    {{< panzoom-figure
    src="images/compressed/complete_assembly.webp"
    alt="Bottom view of the sensor JB Welded into the drilled out plug."
    gallery_class="grid-w55"
    >}}
    {{< panzoom-figure
    src="images/compressed/solenoid_diode.webp"
    alt="Sensor package with additional JB Weld installed into the vacuum tank."
    gallery_class="grid-w45"
    >}}    
{{< /panzoom-gallery >}}

In my initial tests, I found that operating the pump and solenoid would cause the Arduino to reset, seemingly at random, or cause other undefined behavior. Since they were not electrically isolated on a second power supply, that makes sense. They were backfeeding energy and causing a notable amount of general interference during operation, to the point that the LEDs on the inactive relay modules would dimly illuminate when the motor was in operation, and very visibly illuminate whenever the motor or the solenoid deactivated. I had to add flyback diodes, and, for peace of mind, I added ceramic filtering capacitors to the pump as well. Those additions completely eliminated the issues. Electrical engineering is real. Below is a video demonstrating the issue.

{{< youtubeLite id="E-Ngy0T2RyM" >}}

I soldered up a sort of bus bar for the fan connectors, used an Adafruit proto-shield to interface several connectors with the Arduino, and did a similar plug-drilling setup for the water temperature sensors with a generic Dallas temperature probe. That pretty much covers everything noteworthy about the hardware.

## The Software

{{< gitea server="https://git.neet.works" repo="rawhide_k/server-watercooling-controller">}}

As I mentioned earlier, my software is incomplete. The server-side is currently just a brute-force JSON-over-serial reader writte in Python. I will update this section in the future when I have the JSON-serial-Zabbix bridge setup. It will mostly be for intellectual interest to see how the temperatures change throughout the year and whether or not the leak rate changes meaningfully over time. I plan to setup alerts and emergency shutdowns for out-of-bounds leak rates, or pump failure, of course, but with proper soft-tubing setups spontaneous failures are exceedingly rare, and the negative pressure should prevent/notify of any kind of impending failure before anything actually leaks. D5 pump failures are exceedingly rare when run in clean systems at a fixed speed with infrequent starts/stops, but they do happen.

The Arduino does not take commands from the server. It manages the fans and pressure autonomously, for ease of programming / debugging, and so that it can operate independently of a connection to an active server. It doesn't need to know how many devices are in use, or the temperatures of any components, because there are ultimately only two actions it can take. Change the pump speed, or change the fan speed. Fan speed should never be associated with component temperature. It should be associated with water temperature.

Occasionally, the temperature probes as well as the HX711 return spurious readings that cause poor behavior, such as crashing the Arduino. In particular, the temperature probes will sometimes return -127, which caused my PID algorithm to crash the Arduino for reasons I could not divine. In addition, the HX711 occasionally returns wildly wrong results that need to be filtered out.

For the temperature probes, I simply ignore the one problematic result that I've observed.

```c++
new_water_temp = sensors.getTempC(water_therm);
new_air_temp = sensors.getTempC(air_therm);

if (new_water_temp != -127) {
  water_temp = new_water_temp;
}

if (new_air_temp != -127) {
  air_temp = new_air_temp;
}

sensors.requestTemperatures();
```

For the pressure detection issues, I wait one second, and if the pressure is still below the threshold, I then begin pumping. This check happens approximately ten times per second, as the default behavior of the HX711 board that I have is to run in 10hz mode. I'm not sure if the issue springs from some kind of interference with the tachometer interrupts messing up the signaling timing, or if I'm misunderstanding the correct way to sample the HX711 over time.

```c++
if (cur_loop_timestamp - last_pressure_check >= 100) {
  loop_pressure = pressure_raw_to_mbar(hx711.readChannelRaw(CHAN_A_GAIN_64)); 

  if (sucking == false) {
    if (loop_pressure > low_pressure_threshold) {
      if (checking_low_pressure == false) {
        checking_low_pressure = true;
        low_pressure_confirmation_timestamp = cur_loop_timestamp;
      }
      if (cur_loop_timestamp - low_pressure_confirmation_timestamp >= 1000) {
        digitalWrite(pump_relay, HIGH);
        digitalWrite(solenoid_relay, HIGH);
        sucking = true;
        checking_low_pressure = false;
      }
    }

    else if (cur_loop_timestamp - low_pressure_confirmation_timestamp >= 1000) {
      checking_low_pressure = false;
    }
  }

  else {
    if (loop_pressure < high_pressure_threshold) {
      digitalWrite(pump_relay, LOW);
      digitalWrite(solenoid_relay, LOW);
      sucking = false;
    }
  }
  last_pressure_check = cur_loop_timestamp;
}
```

In case of any other issues, I also enabled the watchdog timer for 2 seconds. So, if, for some reason, it does freeze/crash, it should self reset after 2 seconds. It seems to be working, although I guess time will tell in the long-term. I haven't experienced any operation issues since I added it over a month ago. The other concern is undefined behavior when the timer overflows. The Uno only has a 32-bit timer, so it will overflow around 50 days of uptime. This function pre-emptively resets it.

```c++
//we will use this function to periodically self-reset to avoid timer overflows
void(* resetFunc) (void) = 0;

...

//reset the system when approaching timer overflow
if (cur_loop_timestamp >= 4000000000) {
  resetFunc();
}
```

Once per second, the temperature sensors are sampled, the PID loop for the fans runs with the new temperature data points, and the fan speed, temperature data, vacuum pressure, and pump/flow measurements are sent over serial with the help of the ArduinoJSON library. I settled on a target water delta of 4\*C relative to ambient, with a chosen min/max temperature range where the fans turn off or pin themselves to 100% completely. I'm not sure if either of those temperatures will ever be reached, realistically, but it's better to be safe than sorry, right?

```c++
int fan_PID(float* air_temp, float* water_temp, uint32_t* cur_loop_timestamp) {
  static const float kp = 120.0;
  static const float ki = 0.16;
  static const float kd = 4.0;

  static float integral = 0;
  static float derivative = 0;
  static float last_error = 0;
  static float error;
  static float delta;
  static float last_time = *cur_loop_timestamp;
  static const float min_water_temp = 5.0;
  static const float max_water_temp = 40.0;
  static const uint8_t min_fan_speed = 90;
  static const uint8_t max_fan_speed = 255;

  static const uint8_t temp_target_offset = 4;
  static const uint8_t fan_offset = 10;

  static int16_t fan_speed;

  if (*water_temp >= max_water_temp) {
    return max_fan_speed;
  }

  else if (*water_temp <= min_water_temp) {
    return 0;
  }

  else {
    error = *water_temp - min(*air_temp + temp_target_offset, max_water_temp);
    delta = *cur_loop_timestamp - last_time;

    //mitigate unlimited integral windup
    if (fan_speed == max_fan_speed) {
      integral += error * delta;
    }

    if (*air_temp + temp_target_offset > *water_temp - 1) {
      integral = 0;
    }

    derivative = (error - last_error) / delta;
    fan_speed = round(constrain(min_fan_speed + fan_offset + (kp * error + ki * integral + kd * derivative), min_fan_speed, max_fan_speed));
    last_error = error;
    return fan_speed;
  }
}
```

Theoretically the loop should handle water temperatures in excess of 60\*C without the components actually overheating, but lower is better. With all the currently connected components running at 100% use, and 100% fan speed, the delta between air and water is <10\*C. In the summer, the water temperature might broach 40\*C, but I don't know. I haven't monitored the actual ambient temperature in the garage before now. My garage is partially underground, and my rack is situated in the back, where it is deepest, so the temperatures tend to stay more mild than the outside. So far this winter, the air temperature measured by the Arduino has tended to stay 10-20\*C higher than the ambient air temperature outside, so it would need to be *very* cold to actually have the loop be at-risk of freezing. In that extreme case, in my testing, turning off the fans allows heat to accumulate to a sufficient degree (even at idle) that there is no need to be concerned with antifreeze additives.

## Other Thoughts?

Just a note, the software hadn't been 100% finalized when I took the below pictures. The control box does have a lid now, and all the cable management is a lot cleaner... Promise!

{{< panzoom-gallery caption="Everything installed and working!">}}
    {{< panzoom-figure
    src="images/compressed/complete_a.webp"
    alt="Front-ish view of the complete rack assembly."
    gallery_class="grid-w50"
    >}}
    {{< panzoom-figure
    src="images/compressed/complete_b.webp"
    alt="Back-ish view of the complete rack assembly."
    gallery_class="grid-w50"
    >}} 
{{< /panzoom-gallery >}}

This project had a lot of firsts for me. It was the first time I've done any kind of embedded-adjacent development beyond "ooooo look at the blinky light, oooooooo it turns off when you press the button, wwaaaow", and the first time I'd designed something with so many individual parts. I've never worked with air pumps, solenoids, or pressure sensing before, nor had to debug issues like the lack of flyback diodes.

I learned that I hate drilling through sheet steel, especially without a drill press. I really, really hate drilling through steel. I should have gotten an aluminum or plastic project box instead of using that stupid battery box. If I were to ever take it apart again, I'd add a passthrough for the SPI header, and/or an external reset button. I'd like to think that I'm going to stop poking into boxes that have live electricity inside of them, but I'm not sure that one is going to stick. I should have gotten a physical display of some type that could show the sensors and debug info on the device itself without being connected to another device to readout the data.

I'd like to get a second pump, for redundancy's sake and to increase the flow rate. But it's going to be such a pain to install that I feel like I'm never going to bother to do it, unless the current pump fails, or I add more components to be cooled and the flow is adversely affected. I was also slightly concerned about the evaporation rate of the liquid via the vacuum tank, and that I'd need to add some kind of fluid level detection system, but there's been no noticeable loss thus far. Now that I know the pump turns on so infrequently, I can't imagine that it's going to need to be topped up anytime soon.

Godbwye.

[^pascalbad]: In modern, post-Turing cards, that is. Please stop buying mesozoic-era Kepler/Maxwell Quadros and Teslas just because they have VRAM. There's a reason they're going for like, $20, and if you paid more for anything from that era, I'm sorry. Electrical costs are a thing, and your life is worth more than waiting for any meaningful, current-year work to happen on those decrepit e-waste cards. You can make an argument for Volta, but only if you're doing some deranged pure FP64 stuff. Consumer Turing and newer are faster at everything else! And if you're buying them for HW-accel encode... The quality is awful compared to any Intel ARC card. Buy one of those instead.

[^thermalfears]: I don't understand why people don't trust the manufacturer specifications when it comes to silicon temperature limits, beyond unfounded conspiracy nonsense around planned destruction/obselence. In terms of Intel server SKUs, you find that the throttling temp is *higher* than on consumer SKUs, despite the higher reliability demanded by the enterprise market... I'm assuming that this is due to reduced hotspot variance thanks to generally lower voltage spread from lower boosting clock speeds. On enterprise SKUs which are focused on single threaded performance, the throttling temp is typically lower than those without the ability to boost as high. If you have evidence to the contrary, let me know.

[^badnomenclature]: I don't understand why people call custom loops 'open loops'. They're not open. They're closed. People correctly use the phrase 'closed loop' when referring to AIOs. This phrasing has been pervasive for at least ten years and it bugs me a lot. AIOs are sealed units where the liquid has no interaction with the external environment. Custom loops are sealed units where the liquid has no interaction with the external environment. They're both closed in operation. Outside of the PC watercooling space, 'open loop' would imply that your cooling method intakes fresh coolant and outputs waste that is not directly recovered. LN2 overclocking, in the PC world, is a form of open loop liquid cooling. If you were putting water into your loop via your sink, and dumping the output into the drain, that would be open loop water cooling. Eternally recycling the same liquid in a sealed loop is not open. It's closed. It's a closed loop.