require "uglifier"
require "mediawiki_api"
require "dotenv"

Dotenv.load "../.env"

local = ENV["LOCAL_RUN"] == "true"

client = MediawikiApi::Client.new "https://spaceidle.game-vault.net/w/api.php"
client.log_in "Stunthacks@IconBot", ENV["BOT_TOKEN"]

svgs = []
pngs = []
js = ""

# svgs
Dir.entries(".").each do |f|
    svgs.push f
    if f != "." and f != ".."
        split = f.split("_")
        js += "icons_svgs[\"#{split[1].split(".")[0]}\"] = '#{File.read("./" + f).strip}';\n".gsub(' style="height: 512px; width: 512px;"', "").gsub('<?xml version="1.0" encoding="utf-8"?>', "")
    end
end

# pngs
Dir.entries("../png").each do |f|
    pngs.push f

    puts f
end

# js
minified = Uglifier.compile(File.read("../usi.js").gsub("/* {ICON_PLACEHOLDER} */", js))

old = client.get_wikitext "MediaWiki:Common.js"
if old.body != minified
    puts "Updating usi.js on wiki..."
    client.action :edit, title: "MediaWiki:Common.js", text: minified, summary: "[BOT] Updating to newest usi.js", bot: true unless local
else
    puts "JS file is up to date."
end

# icon showcase
base = "=== Base Tiles ===
<div class=\"icon-showcase\"><strong>Materials</strong>{{Icon|Materials|Class=base-icon mats}}{{C|<nowiki>{{Icon|Materials}}</nowiki>}}</div>
<div class=\"icon-showcase\"><strong>Parts</strong>{{Icon|Parts|Class=base-icon parts}}{{C|<nowiki>{{Icon|Parts}}</nowiki>}}</div>
<div class=\"icon-showcase\"><strong>Components</strong>{{Icon|Components|Class=base-icon comps}}{{C|<nowiki>{{Icon|Components}}</nowiki>}}</div>
<div class=\"icon-showcase\"><strong>BaseBooster</strong>{{Icon|BaseBooster|Class=base-icon booster}}{{C|<nowiki>{{Icon|BaseBooster}}</nowiki>}}</div>
<div class=\"icon-showcase\"><strong>DoubleBooster</strong>{{Icon|DoubleBooster|Class=base-icon double-booster}}{{C|<nowiki>{{Icon|DoubleBooster}}</nowiki>}}</div>
<div class=\"icon-showcase\"><strong>DrainReducer</strong>{{Icon|DrainReducer|Class=base-icon drain-reducer}}{{C|<nowiki>{{Icon|DrainReducer}}</nowiki>}}</div>
<div class=\"icon-showcase\"><strong>MatsBooster</strong>{{Icon|MatsBooster|Class=base-icon mats-booster}}{{C|<nowiki>{{Icon|MatsBooster}}</nowiki>}}</div>
<div class=\"icon-showcase\"><strong>PartsBooster</strong>{{Icon|PartsBooster|Class=base-icon parts-booster}}{{C|<nowiki>{{Icon|PartsBooster}}</nowiki>}}</div>
<div class=\"icon-showcase\"><strong>CompsBooster</strong>{{Icon|CompsBooster|Class=base-icon comps-booster}}{{C|<nowiki>{{Icon|CompsBooster}}</nowiki>}}</div>\n"

output = {
    :general => "",
    "Shards" => "=== Shards ===\n",
    "Synth" => "=== Synth Materials ===\n",
    "Achievement" => "=== Achievement Exclusive ===\n",
    "Alien" => "=== Specimen & Alien Mats ===\n",
    :base => base,
    :enemies => "=== Enemies ===\n",
    "UIIcon" => "=== Wiki UI Icons ===\n",
}

svgs.each do |f|
    if f != "." and f != ".."
        split = f.split("_")
        out = "<div class=\"icon-showcase\"><strong>#{split[1].split(".")[0]}</strong>{{Icon|#{split[1].split(".")[0]}|Class=core-icon}}{{C|<nowiki>{{Icon|#{split[1].split(".")[0]}}}</nowiki>}}</div>\n"

        next if split[0] == "Base"
        classes = {
            "Shards" => "shard-tier-7",
            "Synth" => "synth-tier-10",
            "Alien" => "alien-synth",
            "Achievement" => "synth-tier-5",
            "UIIcon" => "icon-ui"
        }

        if output[split[0]].nil?
            output[:general] += out
        elsif !output["#{split[0]}"].nil?
            output["#{split[0]}"] += out.gsub("core-icon", classes[split[0]])
        end
    end
end

output["UIIcon"] += "<div class=\"icon-showcase\">" \
"<strong>UISalvage</strong>" \
"{{Icon|UISalvage}}{{C|<nowiki>{{Icon|UISalvage}}</nowiki>}}" \
"</div>
<div class=\"icon-showcase\">" \
"<strong>UIVoidMatter</strong>" \
"{{Icon|UIVoidMatter}}{{C|<nowiki>{{Icon|UIVoidMatter}}</nowiki>}}" \
"</div>"

showcase = "== All Icons ==
<div class=\"showcase-container\">
#{output.map{|k, v| v}.join "\n"}" \
"</div>"

old = client.get_wikitext "Template:IconShowcase"
if old.body != showcase
    puts "Updating icon showcase on wiki..."
    client.action :edit, title: "Template:IconShowcase", text: showcase, summary: "[BOT] Updating to show newest icons", bot: true unless local
else
    puts "Icon showcase is up to date."
end

# css
css = File.read("../usi.css")
old = client.get_wikitext "MediaWiki:Common.css"
if old.body != css.strip
    puts "Updating usi.css on wiki..."
    client.action :edit, title: "MediaWiki:Common.css", text: css, summary: "[BOT] Updating to newest usi.css", bot: true unless local
else
    puts "CSS file is up to date."
end
