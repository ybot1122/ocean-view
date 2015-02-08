<h1>Hack Housing: Mapping Federal Assisted Housings</h1>
<h3>The Crew</h3>
@ybot1122 (Toby Liu) - Developer
@zenev (Nevan Wichers) - Developer
@EllenDong92 (Ellen Dong) - UI Designer
@xky1231 (Frank Xu) - Researcher/PM
@Mingye (Wanli Cheng) - Map Expert
<h3>Why This App</h3>
<p>Data has been released. We want the general public to not only see this data, but be free to use it for their own decisions.</p>
<p>Too many apps to make decisions and assumptions about a user's intent with the data. This distorts the way it gets presented. This will affect implementation decisions that perhaps cause certain meanings and inferences to become hidden from the user.</p>
<p>We want users to have data in an understandable format, but also have the app be general-purpose.</p>
<h3>What It Does</h3>
<p>A graphical interface to analyze low-income housing options (currently, any multi-family property that is eligible for a type of federal subsidy).</p>
<h3>What We Want to Prove</h3>
<p>Tech won't solve problems. A webapp that consumes data, abstracts it, then produces suggestions is really not much better than the government selectively releasing their private data.</p>
<p>Tech FACILITATES the solutions to social issues. Our app is guided by the notion that we want to guide conversation, not define it. Not even necessarily start it. We just want people to have honest data. We are a channel of communication, a method of information transfer, a mechanism for spreading awareness.</p>
<h3>How to Use</h3>
<p>Just run zillow.html; everything is front-end. It depends on the HUD api's to still be accessible.</p>
<p>On line 262 of zillow.html, you can modify the second argument to filter the geographical range of assessment. The format of that argument should be [min long, min lat, max long, max lat]</p>
<p>When you open the page, be sure to also open JavaScript console as we print useful information to show the data being loaded (it can take a while depending on the range you specify).</p>