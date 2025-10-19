require "uglifier"
require "mediawiki_api"

client = MediawikiApi::Client.new "https://spaceidle.game-vault.net/w/api.php"
client.log_in "Stunthacks@IconBot", ENV["BOT_TOKEN"]

files = []
js = ""

Dir.entries(".").each do |f|
    files.push f
end

files.each do |f|
    if f != "." and f != ".."
        split = f.split("_")
        js += "icons_svgs[\"#{split[1].split(".")[0]}\"] = '#{File.read("./" + f).strip}';\n".gsub(' style="height: 512px; width: 512px;"', "").gsub('<?xml version="1.0" encoding="utf-8"?>', "")
    end
end

minified = Uglifier.compile(File.read("../usi.js").gsub("/* {ICON_PLACEHOLDER} */", js))

client.action :edit, title: "MediaWiki:Common.js", text: minified, summary: "[BOT] Updating to newest usi.js", bot: true

# icon showcase
general = ""
base = "=== Base Tiles ===\n"
shards = "=== Shards ===\n"
materials = "=== Synth Materials ===\n"
achievements = "=== Achievement Exclusive ===\n"
alien = "=== Specimen & Alien Mats ===\n"
ui = "=== Wiki UI Icons ===\n"

base += "<div class=\"icon-showcase\"><strong>Materials</strong>{{Icon|Materials|Class=base-icon mats}}{{C|<nowiki>{{Icon|Materials}}</nowiki>}}</div>\n"
base += "<div class=\"icon-showcase\"><strong>Parts</strong>{{Icon|Parts|Class=base-icon parts}}{{C|<nowiki>{{Icon|Parts}}</nowiki>}}</div>\n"
base += "<div class=\"icon-showcase\"><strong>Components</strong>{{Icon|Components|Class=base-icon comps}}{{C|<nowiki>{{Icon|Components}}</nowiki>}}</div>\n"
base += "<div class=\"icon-showcase\"><strong>BaseBooster</strong>{{Icon|BaseBooster|Class=base-icon booster}}{{C|<nowiki>{{Icon|BaseBooster}}</nowiki>}}</div>\n"
base += "<div class=\"icon-showcase\"><strong>DoubleBooster</strong>{{Icon|DoubleBooster|Class=base-icon double-booster}}{{C|<nowiki>{{Icon|DoubleBooster}}</nowiki>}}</div>\n"
base += "<div class=\"icon-showcase\"><strong>DrainReducer</strong>{{Icon|DrainReducer|Class=base-icon drain-reducer}}{{C|<nowiki>{{Icon|DrainReducer}}</nowiki>}}</div>\n"
base += "<div class=\"icon-showcase\"><strong>MatsBooster</strong>{{Icon|MatsBooster|Class=base-icon mats-booster}}{{C|<nowiki>{{Icon|MatsBooster}}</nowiki>}}</div>\n"
base += "<div class=\"icon-showcase\"><strong>PartsBooster</strong>{{Icon|PartsBooster|Class=base-icon parts-booster}}{{C|<nowiki>{{Icon|PartsBooster}}</nowiki>}}</div>\n"
base += "<div class=\"icon-showcase\"><strong>CompsBooster</strong>{{Icon|CompsBooster|Class=base-icon comps-booster}}{{C|<nowiki>{{Icon|CompsBooster}}</nowiki>}}</div>\n"

files.each do |f|
    if f != "." and f != ".."
        split = f.split("_")
        out = "<div class=\"icon-showcase\"><strong>#{split[1].split(".")[0]}</strong>{{Icon|#{split[1].split(".")[0]}|Class=core-icon}}{{C|<nowiki>{{Icon|#{split[1].split(".")[0]}}}</nowiki>}}</div>\n"
        case split[0]
        when "Shards"
            shards += out.gsub("core-icon", "shard-tier-7")
        when "Synth"
            materials += out.gsub("core-icon", "synth-tier-10")
        when "Alien"
            alien += out.gsub("core-icon", "alien-synth")
        when "Achievement"
            achievements += out.gsub("Class=core-icon", "Color=#B26600")
        when "UIIcon"
            ui += out.gsub("core-icon", "icon-ui")
        when "Base"
        else
            general += out
        end
    end
end

showcase = "== All Icons ==\n<div class=\"showcase-container\">\n#{general}\n#{base}\n#{shards}\n#{materials}\n#{achievements}\n#{alien}\n#{ui}<div class=\"icon-showcase\"><strong>UISalvage</strong>{{Icon|UISalvage}}{{C|<nowiki>{{Icon|UISalvage}}</nowiki>}}</div>\n<div class=\"icon-showcase\"><strong>UIVoidMatter</strong>{{Icon|UIVoidMatter}}{{C|<nowiki>{{Icon|UIVoidMatter}}</nowiki>}}</div>\n</div>"
client.action :edit, title: "Template:IconShowcase", text: showcase, summary: "[BOT] Updating to show newest icons", bot: true
