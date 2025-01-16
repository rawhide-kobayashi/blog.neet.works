---
title: Watercooling My Homelab
description: Watercooling for my homelab with a custom, leak-resistant controller and monitoring!
date: 2025-01-16T05:56:41.351Z
preview: /Supermicro_846_Internal.webp
draft: false
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
slug: watercooling-homelab
---

## Overview
I've been watercooling my desktop since 2020, and case modding custom cooling solutions since my first modern dGPU in 2012. I enjoy it for the aesthetic, as well as the ability to run my hardware to the redline, despite the lower gains that modern hardware has... It's still fun to try and see how high you can get on benchmark scoreboards. It was a big initial investment, but with most parts being reusable, the ongoing cost for component upgrades are minimal. Early in 2024, I bought some GPUs to use for dedicated ML tasks in my server rack, and immediately had watercooling on the mind. There weren't particularly strong reasons to do so, but it would lower the power usage a bit, give me some more VRAM overclocking headroom, and give me a bit more core clock stability, as well as the ability to use a cheap two-slot NVLINK connector without suffocating a GPU.

{{< panzoom-figure
    src="images/compressed/Triple_Card_Jank.webp"
    alt="My initial setup with 3x 2080 Tis, using m.2 NVMe to PCIe risers in an ASUS prebuilt. Two are connected by NVLINK, which I found to provide a slight performance benefit on the order of ~1-5% in multi-GPU SISR training, which is not worth the typical price for NVLINK bridges from this era. I was lucky to get this ugly, quadro-oriented bridge for just $40."
    caption="My initial setup with 3x 2080 Tis, using m.2 NVMe to PCIe risers in an ASUS prebuilt. Two are connected by NVLINK, which I found to provide a slight performance benefit on the order of ~1-5% in multi-GPU SISR training, which is not worth the typical price for NVLINK bridges from this era. I was lucky to get this ugly, quadro-oriented bridge for just $40."
>}}

I've never had a leak on my desktop, but with wider temperature swings in my garage, and collectively, a whole lot more expensive hardware that might get damaged than compared to my desktop setup, I was hesitant. The benefits seemed minimal, and I considered it a fun what-if scenario until I upgraded my main server and discovered that the forced-air passive chassis cooling was insufficient for my new CPUs. At that point, I had to make a decision: Get better heatsinks, which would be single-purpose and cost in excess of $100 each, or whole rack watercooling. I chose whole rack watercooling.

With enough reason for me to go ahead with the project, and the only thing holding me back being a fear of leaks, I had to figure out how to actively monitor for, and preferably prevent such an eventuality. I happened upon a product called [LEAKSHIELD](https://shop.aquacomputer.de/Water-Cooling/Leak-testing-prevention/LEAKSHIELD-leak-prevention-system-standalone::4063.html), from Aqua Computer, that advertised itself as doing exactly that.

{{< youtubeLite id="8UiRv0nDch0" >}}

How does it work? You pull a vacuum inside the fluid loop and monitor the loss rate. Water can't get out if air is trying to get in, and if air gets in, the vacuum is reduced. It's so simple, I don't know why it took this long for such a product to enter the PC watercooling space. I could have just bought a LEAKSHIELD and called it a day, but Aqua Computer's software doesn't support Linux, and the specs for the vacuum pump seemed a bit weak for a loop of my scale. But, its functionality was something I was confident I could emulate with more robust off-the-shelf parts. Thus, sufficiently armed with esoteric plumbing knowledge, I took the plunge and started loading up on parts.

## The Hardware
Most of the build uses pretty standard off-the-shelf parts for PC watercooling, but there are a few bits and pieces that most builders won't have seen before, and a custom control system that offers a more relevant experience for a server rack. The control system is based on an Arduino Uno that feeds vital statistics over serial, and features pressure control and monitoring similar to the LEAKSHIELD, with fan control based on a PID algorithm keeping the water temperature at a fixed setpoint above ambient.

### Off-the-shelf
#### General Details
The centerpiece of the build, which the control unit and pump mount to, is the "MOther of all RAdiators", version 3, from Watercool. This is the 360mm version with support for up to 18x 120mm fans, or 8x 180mm fans. It's constructed more in the spirit of a vehicle radiator than a traditional PC radiator, with a less restrictive fin stack and large, round tubes rather than thin rectangular ones. It provides several mounting points for accessories which I was able to utilize to secure it to my server rack in a satisfactorily sturdy fashion. An in-depth teardown on the construction method and material quality of the MO-RA can be found on [igor'sLAB](https://www.igorslab.de/en/the-big-radiator-material-test-how-much-copper-and-technology-is-in-the-watercool-mo-ra3-360-pro-part-4/). For fans, I have a collection of old DC-control Corsair Air Series SP120s. They've all been retired from regular use, because of noise-related aging issues. In fact, one of them failed to turn at all once I had everything wired up, and another had its bearing disintegrate about 8 weeks after putting the thing into service. That being said, they did survive (and continue to survive, in the remaining 16 cases) 24/7 use for anywhere from 4-10 years, at bottom of the barrel pricing, so that's not too bad. I'm not exactly pushing the limits of this radiator here, so a few fans breaking down over time isn't the end of the world.


{{< panzoom-figure
    src="images/compressed/MO-RA!.webp"
    alt="A MO-RA V3 360 PRO PC Watercooling Radiator from [Watercool](https://watercool.de)"
    caption="A MO-RA V3 360 PRO PC Watercooling Radiator from [Watercool](https://watercool.de)"
>}}

I got a secondhand Corsair XD5 pump/res combo from eBay for about sixty bucks, which is pretty good for a genuine D5-based pump/res combo. It has PWM support which I did wire up, but the flow ended up being rather anemic even at 100%, so I just run it full speed all the time. The flow rate is measured through an [Aqua Computer flow sensor](https://shop.aquacomputer.de/Monitoring-and-Controlling/Sensors/Flow-sensor-high-flow-LT-G1-4::3951.html), which is simply a hall-effect tachometer translated to l/h through software. I did not attempt to verify the accuracy of the sensor in my setup. The absolute accuracy is less relevant than simply getting an overall idea of whether or not the measurement is consistent with flow behavior, which it is.

{{< panzoom-figure
    src="images/compressed/Mounting_Detail.webp"
    alt="Simple, cheap aluminum bars and angles mount to the studs on the radiator and into the stud holes on the server rack, and the pump and control box mount onto brackets along with the fans."
    caption="Simple, cheap aluminum bars and angles mount to the studs on the radiator and into the stud holes on the server rack, and the pump and control box mount onto brackets along with the fans."
>}}

#### CPUs
My thermally problematic server upgrade was to dual Xeon Gold 6154s, which are Skylake-SP architecture. This specific SKU is pretty beefy, with 18 cores at sustained all-core speeds of 3.7GHz SSE / 3.3GHz AVX2 / 2.7GHz AVX512, and a TDP of 200 watts. The rated tjmax was 105C, and with the chassis cooling, they readily met that and started throttling under all-core loads, with idle as high as 60-70\*C. I previously had Xeon E5-2697 v2s, which had TDPs of 130w. They got toasty, but never throttled. I'm not sure if the chassis had any easy fan upgrades available that might have made a difference, and I certainly could have moved to 4u-compatible tower coolers rather than forced air, but since I wanted to watercool the GPUs anyway, adding the CPUs as well would be minimal cost/effort, with more future compatibility for the waterblocks compared to a specialized LGA3647 tower cooler.

{{< panzoom-figure
    src="images/compressed/Coldplate.webp"
    alt="Alphacool Eisblock XPX Pro coldplate. Image credit & copyright - [igor'sLAB](https://www.igorslab.de/en/ryzen-threadripper-2990-wx-with-500-w-alphacool-iceblock-xpx-aurora-pro-plexi-digital-rgb-in-test/)"
    caption="Alphacool Eisblock XPX Pro coldplate Image credit & copyright - [igor'sLAB](https://www.igorslab.de/en/ryzen-threadripper-2990-wx-with-500-w-alphacool-iceblock-xpx-aurora-pro-plexi-digital-rgb-in-test/)"
>}}

The CPU waterblocks are Alphacool Eisblock XPX Pro Aurora Light models, which are significantly cheaper than the XPX Aurora Pro not-light version. They appear to be entirely identical, functionally... I'm not sure if there any actual performance benefits offered by the not-light version. It's a relatively obscure block family without many thorough reviews, which makes sense, given this block is designed for full coverage on Xeons/Threadrippers. The coldplate appears to be [skived](https://en.wikipedia.org/wiki/Skiving_(metalworking)#Heat_sinks), which is uncommon in this price bracket for a discrete block, and the fins are incredibly short and dense. In smaller desktop loops, I've seen this block criticized for having overly restrictive flow, but when you have four blocks + quick disconnects, "good" flow is relative.  At the power limit of 200w, the maximum core temperature delta relative to the water temperature is 25\*C, with a ~1-2\*C average delta between the two serially-connected sockets at a flow rate of ~130L/h, and that's more than sufficient.

{{< panzoom-figure
    src="images/compressed/Dual_Blocks_Zoom.webp"
    alt="Interior view of the Supermicro CSE-846 chassis showcasing the installed waterblocks and other components."
    caption="Interior view of the Supermicro CSE-846 chassis showcasing the installed waterblocks and other components."
>}}

#### GPUs
The GPU blocks are Phanteks 2080 Ti Founder's Edition blocks. Nothing special, they're just the cheapest matching ones I could find in 2024 that looked like they'd fit these almost-reference-but-not-quite OEM cards. They're generic OEM models that would have gone in prebuilts. The most interesting thing about these cards, is that they've been modded to have 22GB of VRAM. There's a [dedicated supplier](https://2080ti22g.com/ "#not an ad, but it could be 🪝☝️😜") still offering them, and it's by far the best $/GB value for VRAM in modern NVIDIA GPUs.[^pascalbad] Whether or not this is a better value overall than, say, a 3090 (Ti) depends on your usecase. Performance improvements in ML tasks between the 2080 Ti and 3090 (Ti) range from as little as ~20% to as much as ~100% depending on how memory bandwidth constrained your workload is. With secondhand 3090 (Ti)s still going for minimum $700 on the used market in the US, I found the alternative 2080 Ti option to be more alluring for my usecase, which is primarily single image super-resolution. More VRAM is desirable to increase the size of tiles for inference, and to increase the batch size during training. Training speed scales almost linearly, and inference speed scales linearly, per GPU. So, for my usecase, where I'm not really limited by the performance of a single GPU, the 2080 Ti mod route offers better overall value both for VRAM and combined core performance compared to 3090 (Ti)s. The idea of having a modded GPU in itself was also appealing and definitely part of why I made that decision. Pulling up a hardware monitor and seeing a 2080 Ti with 22GB of VRAM  feels a little bit naughty, and I like that.

{{< panzoom-figure
    src="images/compressed/GPUs_Installed.webp"
    alt="The blocks installed in an ASUS prebuilt gaming tower."
    caption="The blocks installed in an ASUS prebuilt gaming tower."
>}}

I did initially buy three of them, as pictured at the beginning of this post, but one of them failed just after the 30 day warranty period listed on their website. Despite that, they were kind enough to offer a full refund if I covered return shipping, and were very communicative and responded in <24 hours every time I sent them any kind of message/inquiry.

The biggest benefit that watercooling theoretically brings to modern video cards is a prolonged lifespan. Not due to lower core temperatures,[^thermalfears] in an absolute sense, but due to the reduced stress from thermal cycles. Mismatches in the rate of thermal expansion between the die and the substrate will eventually cause their bond to break, and this happens faster the larger your die is, and the more extreme the temperature differences are. Today's GPU dies are huge, and it's hard to say how many failures are attributable to this factor alone, but it is certain to be more of a risk than it has been in the past. I'd rather buy a used mining GPU than a used gaming GPU any day, because it has likely been kept at roughly the same temperature for most of its life, as opposed to experiencing wide periodic swings.

{{< panzoom-gallery caption="The GPU blocks required a *moderate amount of light massaging* to properly fit on these OEM model cards. The power plugs are in a different position and a singular capacitor on these models is slightly taller than on the actual Founder's Edition reference card, but they're otherwise close enough to identical.">}}
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

That's not to say that there are no benefits from lowering the operating temperature. As an absolute value, within manufacturer limits, it affects boost clocks, and [leakage current](https://en.wikipedia.org/wiki/Leakage_(electronics)#In_semiconductors). A cooler chip will use less power to run at the same clock speed compared to a hotter chip due to reduced leakage current, making them measurably more energy efficient per clock cycle the colder they run. In my case, with the fan on max, while not thermal throttling, these GPUs would bounce off the power limit of 280w while attempting to hit a core clock of 1800MHz. Under water, at a reported core temperature of ~30*C, the reported board power draw is only ~220w at 1800MHz[^overclockingonlinux] core clock for the same workload. The type of fan typically found in these coolers is rated anywhere from 15-30w on its own, so a reduction of at least 30w can likely be attributed to a lower leakage current.

### DIY Time
In no particular order, here is a list of the major components involved in the control system.
- Generic metal box, formerly from a PBX system.
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
    alt="Fit check for all the major components."
    caption="Fit check for all the major components."
>}}


I didn't take excruciatingly detailed pictures of every single step of the assembly/prototyping process. For the most part, I was just plugging pre-made components together. The most interesting production notes include the pressure sensor and the power supply.

#### Putting New Life into an iMac PSU
The power supply I used is from a first-gen Intel White iMac, which is visually very similar to the G5. It was one of the earliest things that I installed Linux on, and I used it as a seedbox for a bit, but eventually took it apart and saved some of the more interesting stuff.

All the credit goes to the user *ersterhernd*, from [this thread](https://www.tonymacx86.com/threads/imac-isight-model-power-supply-unleashed.150793/) on the [tonymacx86.com](https://tonymacx86.com) forum for figuring out the pinout of this PSU, which is almost entirely identical to the one that was in my unit, apart from the power rating on mine being 200w. There are two banks of pins, half of which are always on, half of which are toggleable. Each bank has 12v, 5v, and 3.3v. I didn't end up using 3.3v for anything other than the power switch. I have no idea what the energy efficiency of this unit is, obviously it doesn't have an 80+ certification... But I'm assuming that Apple would make it at least halfway decent. Hopefully more efficient than a random 12v power brick with additional converters, I'd hope.

{{< panzoom-figure
    src="schematic_minify.svg"
    alt="My schematic for the control unit. It was the first time I've ever used KiCad, and the first time I've ever made a schematic like this at all. I hope it's relatively legible."
    caption="My schematic for the control unit. It was the first time I've ever used KiCad, and the first time I've ever made a schematic like this at all. I hope it's relatively legible."
>}}

As you can see in the schematic above, the always-on 3.3v pin is connected to SYS_POWERUP through a relay board. The relay input is pulled low by a single pole switch, which turns the relay on, which connects ground to SYS_POWERUP, engaging the other rail of the power supply. This is kind of a convoluted solution to not having a double-pole switch... But I didn't have a double-pole switch, so that's what I did.

#### Measuring vacuum
The leak-resisting aspect all hinges on monitoring the pressure of the loop... Or potentially running a vacuum pump constantly, but that's stupid. For some reason, I had a really hard time finding a vacuum pressur sensor. There are plenty of physical, analogue vacuum gauges available, but as far as an electronic sensor... I just couldn't find any located in the US, at a reasonable price. There were a few hobbyist grade differential sensors, but I wanted to be able to measure down to an almost complete vacuum, and they didn't have the range. Maybe I had the wrong search terms, but I just wasn't finding anything. Eventually I found an unpackaged sensor with obscure, not entirely legible datasheets that claimed to have an acceptable pressure range for my application. The [MD-PS002](https://electronperdido.com/wp-content/uploads/2021/12/MD_PS002-Datasheet.zh-CN.en_.pdf) is what I settled on, available on Amazon in the US in a 2-pack for $8. It's a tiny little thing, and it took two attempts to successfully create a sensor package that didn't leak.

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

I drilled a hole in a G1/4" plug, just slightly bigger than the metal ring on the sensor, coated that ring with J-B Weld, and inserted it, letting it cure before grinding away the exterior of the top of the plug and building up more J-B weld to add some strain relief for the wires as well as edge-to-edge sealing. The current vacuum loss rate, after running the system for a few months, allowing the loop to very thoroughly de-gas, is now less than 50mbar per day at -500 to -600mbar. I was slightly worried about the lifetime of the pump, given it's a cheap thing from Amazon, but given it only has to run for about a second every 2-3 days, I imagine that won't be an issue.

Here's a quick video showing the system not leaking!

{{< youtubeLite id="wCmtzoBKFZg" >}}

This pressure sensor is a wheatstone bridge, which works the same way as load cells for digital scales. The resistance changes are very, very low, thus the signal must be amplified before being fed into an ADC. You could use an op-amp, and feed that signal into an analog input on the Arduino, but I felt more comfortable using the HX711, a two-channel ADC with integrated amplifier designed to be used with wheatstone bridge load cells. Here's a code snippet showing how I converted the raw analog measurement to mbar.

```c++
float pressure_raw_to_mbar(int32_t pressure_raw) {
  return (pressure_raw - 390000) * (1700.0 / (5600000 - 390000)) - 700;
}
```

I calibrated it manually, comparing it to an analogue gauge. It's calibrated to a zero point at atmospheric pressure in my locale, and from -700mbar to +1000mbar. I figured out that, when setting the HX711 to a gain of 64 with the Adafruit HX711 library, a change of 100mbar is a change in the ADC measurement by 30k, highly consistent across the entire pressure range that I tested. I can't be 100% sure how accurate the analogue gauge is, but 100% accuracy doesn't really matter for this application. All I really need to know is the fact that an adequate vacuum is present, and a general idea of the leak rate, which is a requirement that this setup meets.

#### Other stuff
I got a beefy PWM motor driver with L298 logic, claiming a continuous current of 7 amps per channel, which nicely fit my requirements. 120mm PC fans are typically 0.2-0.3 amps, and mine in particular are 0.25. For 18 fans, it should be approximately 4.5 amps at 100% speed. It's a bit oversized, and I'm only using one channel, but it leaves me the option in the future to use larger, generic radiator fans that have more demanding power requirements. I'm already down two from eighteen, eventually enough of them are going to fail that I'll have to find another solution.

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

In my initial tests, I found that operating the pump and solenoid would cause the Arduino to reset, seemingly at random, or cause other undefined behavior. Since they were not electrically isolated on a second power supply, that makes sense. They were backfeeding energy and causing a notable amount of general interference during operation, to the point that the LEDs on the inactive relay modules would dimly illuminate when the motor was in operation, and very visibly illuminate whenever the motor or the solenoid deactivated. I had to add flyback diodes, and, for peace of mind, I added ceramic filtering capacitors to the pump as well. Those additions completely eliminated the issue. Below is a video demonstrating the bad behavior.

{{< youtubeLite id="E-Ngy0T2RyM" >}}

I did a similar plug-drilling setup for the water temperature sensor with a generic Dallas temperature probe. The air probe was taped to the exterior of the box, in the path of the incoming air. All that remained was to solder up a sort of bus bar for the radiator fan connectors, get the temperature probes and pull-up resistors wired into the proto board, and hook everything up to the Arduino, then write the software to tie it all together.

## The Software
{{< gitea server="https://git.neet.works" repo="rawhide_k/server-watercooling-controller">}}

The Arduino operates independently, without a server. The fan speed and loop pressure are managed autonomously. The serial connection is only used to report vital stats, for later integration into more connected monitoring systems. Ultimately, there are only two actions it can take: Change the fan speed, and turn on the vacuum pump. Neither of these require any external knowledge. It doesn't need any information about the connected hardware to function correctly. All it's concerned with is keeping the water temperature at a certain delta above ambient temperature, and keeping the loop pressure within a certain range. Ultimately, very simple.

Once per second, the temperature sensors are sampled, the PID loop for the fans runs with the new temperature data points, and the fan speed, temperature data, vacuum pressure, and pump/flow measurements are sent over serial with the help of the ArduinoJSON library. I settled on a target water delta of 4\*C relative to ambient, with a chosen min/max temperature range where the fans turn off or pin themselves to 100% completely. The 4\*C delta is rather arbitrary. It's approximately the delta that exists when the systems are on, but idle, and the fans are at their minimum speed. That delta can be maintained during 100% CPU load, and during medium-heavy GPU loads, but not both combined. It still stays well under a 10\*C delta in that case, though, so I can't complain.

There are also hard stops to turn the fans off if the water temperature hits 5\*C, and pin them to max if it hits 40\*C. I'm not sure how realistic either of those figures are, but it's better to be safe than frozen up and/or exploded.

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

Occasionally, the temperature probes as well as the HX711 return spurious readings that cause poor behavior, such as crashing the Arduino. In particular, the temperature probes will sometimes return -127, which caused my PID algorithm to crash the Arduino for reasons I could not divine. 

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

In case of any other freezing/crashing issues, I also enabled the watchdog timer for 2 seconds. So, if, for some reason, it does freeze/crash, it should self reset after 2 seconds. It seems to be working, although I guess time will tell in the long-term. I haven't experienced any operation issues since I added it over a month ago. The other concern is undefined behavior when the timer overflows. The Uno only has a 32-bit timer, so it will overflow around 50 days of uptime. This function pre-emptively resets it.

```c++
//we will use this function to periodically self-reset to avoid timer overflows
void(* resetFunc) (void) = 0;

...

//reset the system when approaching timer overflow
if (cur_loop_timestamp >= 4000000000) {
  resetFunc();
}
```

In addition to the temperature probe problem, the HX711 occasionally returns wildly wrong results that need to be filtered out. To compensate for that, if the pressure dips below the threshold, I wait one second, and if the pressure is still below the threshold, I then begin pumping. This check happens approximately ten times per second, as the default behavior of the HX711 board that I have is to run in 10hz mode. I'm not sure if the issue springs from some kind of interference with the tachometer interrupts messing up the signaling timing, or if I'm misunderstanding the correct way to sample the HX711 over time.

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

Currently, my server-side software is incomplete. It's just a brute-force JSON-over-serial reader written in Python, that I glance at from time to time. I plan write a Zabbix bridge, and have that manage the monitoring, alerts, and reactions to catostraphic events, once I have Zabbix properly setup for my systems... But that hasn't happened just yet. I don't expect it to be a particularly interesting event, but if anything comes up I might write a post about it.

## Other Thoughts?
The Arduino's software hadn't been 100% finalized when I took the below pictures. The control box does have a lid now, and all the cable management is a lot cleaner... Promise!

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

When I was testing it, I had an incident where the Arduino crashed, which means the fans stopped... That's a big drawback with the motor controller that I have, it fails off instead of on. But, I haven't experienced any more issues after adding those software fixes. At that time, I was running a full GPU workload... The water temperature exceeded 70\*C. It happened at night, and I have no idea how long it ran like that... Hours. Pretty scary stuff, but it all came out alright.

This project had a lot of firsts for me. It was the first time I've done any kind of embedded-adjacent development beyond "ooooo look at the blinky light, oooooooo it turns off when you press the button, wwaaaow", and the first time I'd designed something with so many individual parts. I've never worked with air pumps, solenoids, or pressure sensing before, nor had to debug issues like the lack of flyback diodes.

The biggest mistake I made was using that stupid battery box. It's steel, and I don't have the tools or experience to work with steel in the way that I intended to. I thought it would look cool, and it does, but if I did it again, I'd use a generic aluminum or plastic project box instead, because it took two entire days plus waiting for new drill bits that can actually cut through it.

If I were to ever take it apart again, I'd add a passthrough for the SPI header, and/or an external reset button. I should have gotten a physical display of some type that could show the sensors and debug info on the device itself without being connected to another device to readout the data.

I'd like to get a second pump, for redundancy's sake and to increase the flow rate. But it's going to be such a pain to install that I feel like I'm never going to bother to do it, unless the current pump fails, or I add more components to be cooled and the flow is adversely affected. I was slightly concerned about the evaporation rate of the liquid via the vacuum tank, and that I'd need to add some kind of fluid level detection system, but there's been no noticeable loss thus far. Now that I know the pump turns on so infrequently, I can't imagine that it's going to need to be topped up anytime soon.

In terms of value... This was unbelievably bad. Buying tower coolers would have allowed the CPUs to run without throttling, and buying another GPU would have overpowered any benefits gained by NVLINK. I haven't tallied up exactly how much I spent on it, but it was at least $1000, including buying new tools and excess materials that I haven't fully used, and excluding the original cost of re-using some parts I already had. I've added risk, maintenance overhead, and pain whenever I swap out hardware in the future. Custom watercooling[^nomenclature] is an ongoing abusive relationship between your fingertips and your ego, or your fascination for slightly more optimized numbers on a screen... But I'd do it again in a heartbeat, because it was fun.

[^pascalbad]: In modern, post-Turing cards, that is. Please stop buying mesozoic-era Kepler/Maxwell Quadros and Teslas just because they have VRAM. There's a reason they're going for like, $20, and if you paid more for anything from that era, I'm sorry. Electrical costs are a thing, and your life is worth more than waiting for any meaningful, current-year work to happen on those decrepit e-waste cards. I feel even worse for you if you got tricked into buying one of those "24GB" or "16GB" cards that are actually 2x12GB and 2x8GB. You can make an argument for Volta, but only if you're doing some deranged pure FP64 stuff. Consumer Turing and newer are faster at everything else! And if you're buying them for HW-accel encode... The quality is awful compared to any Intel ARC card. Buy one of those instead.

[^thermalfears]: I don't understand why people don't trust the manufacturer specifications when it comes to silicon temperature limits, beyond unfounded conspiracy nonsense around planned destruction/obselence. In terms of Intel server SKUs, you find that the throttling temp is *higher* than on consumer SKUs, despite the higher reliability demanded by the enterprise market... I'm assuming that this is due to reduced hotspot variance thanks to generally lower voltage spread from lower boosting clock speeds. On enterprise SKUs which are focused on single threaded performance, the throttling temp is typically lower than those without the ability to boost as high. If you have evidence to the contrary, let me know.

[^nomenclature]: Stop calling them open loops. Open loop systems exchange fluid with the environment. Unless you're getting your water out of the sink and flushing it right down the drain, your system is not open loop. It's closed. I don't understand why people call custom loops "open" and AIOs "closed" when their modes of operation are identical. It's just plain wrong.

[^overclockingonlinux]: NVIDIA overclocking on Linux is awful. There's no way to edit the voltage-frequency curve through the Linux drivers. You can only set the offset. So you can't really make use of dynamic boosting if you want to undervolt. I have the max clock speed clamped at 1800MHz with a core offset to emulate undervolting as you would do on Windows, but it's hard to say if I'm getting the peak performance that I could be getting at whatever the core voltage is under these circumstances - because NVIDIA's Linux drivers ALSO don't report that. VRAM temperature? Nope. VRM? Nope. Hotspot? Nope. You better hope your card works with NVML, too, because otherwise you're going to have to mess around with X to use nvidia-settings.