require "uglifier"
require "mediawiki_api"
require "dotenv"
require "digest"
require 'sassc'

begin
    Dotenv.load "../.env"
rescue
    puts ".env file not found, proceeding without it."
end

local = ENV["LOCAL_RUN"] == "true"

client = MediawikiApi::Client.new "https://spaceidle.game-vault.net/w/api.php"
client.log_in "Stunthacks@IconBot", ENV["BOT_TOKEN"]

svgs = []
enemies = []
js = ""

# svgs
Dir.entries(".").each do |f|
    svgs.push f
    if f != "." and f != ".."
        f = f.gsub(".svg", "")
        split = f.split("_")
        markup = File.read("./#{f}.svg").strip
        name = split[1]
        tmp = "icons_svgs[\"#{name}\"] = '#{markup}';\n"
        js += tmp.gsub(' style="height: 512px; width: 512px;"', "").gsub('<?xml version="1.0" encoding="utf-8"?>', "")
    end
end

# enemies
skipping = ENV["SKIP_ENEMY_PNGS"] == "true"
puts "#{skipping ? "Skipping" : "Verifying"} enemy PNGs..."
upToDate = true
toPurge = []
Dir.entries("../png/enemies").each do |f|
    break if skipping
    enemies.push f
    if f != "." and f != ".."
        f = f.gsub(".png", "")
        split = f.split("_")
        name = split[0]
        type = split[1]
        if split.length == 1
            combined = "#{name}"
        else
            combined = "#{name}_#{type}"
        end
        path = "../png/enemies/#{f}.png"
        wikiPath = "Enemy_#{f}.png"
        changed = false

        response = client.query titles: "File:#{wikiPath}", prop: "imageinfo", iiprop: "sha1|url"
        pages = response.data["pages"]
        page = pages.values.first

        if page["imageinfo"] and !page.key?("missing")
            if page.dig('imageinfo', 0, 'sha1') != Digest::SHA1.file(path).hexdigest
                puts "Updating #{wikiPath}..."
                client.delete_page("File:#{wikiPath}", "[BOT] Deleting outdated icon") unless local
                client.upload_image(wikiPath, path, "[BOT] Updating enemy icon", "ignorewarnings") unless local
                upToDate = false
                changed = true
            end
        else
            puts "Adding #{wikiPath}..."
            client.upload_image(wikiPath, path, "[BOT] Adding new enemy icon", "ignorewarnings") unless local
            upToDate = false
            changed = true
        end
        toPurge.push "File:#{wikiPath}"

        if changed
            response = client.query titles: "File:#{wikiPath}", prop: "imageinfo", iiprop: "url"
        end

        pages = response.data["pages"]
        page = pages.values.first
        url = page.dig('imageinfo', 0, 'url')

        markup = "<img src=\"#{url}\" alt=\"#{type} #{name}\" />"
        js += "enemy_pngs[\"#{combined}\"] = '#{markup}';\n"
    end
end

if upToDate
    puts "Enemy PNGs are up to date."
else
    client.action :purge, titles: "#{toPurge.join "|"}"
    puts "Purging #{toPurge.length} images from cache..."
end

# js
newJs = File.read("../usi.js").gsub("/* {ICON_PLACEHOLDER} */", js)
includedJs = ""

Dir.entries("../js").each do |f|
    if f != "." and f != ".."
        includedJs += File.read("../js/#{f}")
    end
end
newJs = newJs.gsub("/* {JS_PLACEHOLDER} */", includedJs)

minified = Uglifier.compile(newJs)
File.write("../usi.build.js", newJs)

old = client.get_wikitext "MediaWiki:Common.js"
if old.body != minified
    puts "Updating usi.js on wiki..."
    client.action(:edit, title: "MediaWiki:Common.js", text: minified, summary: "[BOT] Updating to newest usi.js", bot: true) unless local
else
    puts "JS file is up to date."
end

# icon showcase
base = File.read "../html/base_showcase.html"
enemies = File.read "../html/enemy_showcase.html"

output = {
    :general => "",
    "Shards" => "=== Shards ===\n",
    "Synth" => "=== Synth Materials ===\n",
    "Achievement" => "=== Achievement Exclusive ===\n",
    "Alien" => "=== Specimen & Alien Mats ===\n",
    :base => base,
    :enemies => enemies,
    "UIIcon" => "=== Wiki & UI Icons ===\n",
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

output["UIIcon"] +=
"<div class=\"icon-showcase\">" \
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
    client.action(:edit, title: "Template:IconShowcase", text: showcase, summary: "[BOT] Updating to show newest icons", bot: true) unless local
else
    puts "Icon showcase is up to date."
end

# css
css = CSSminify.compress(File.read("../usi.css"))
engine = SassC::Engine.new(css, style: :compressed)
minified = engine.render
old = client.get_wikitext "MediaWiki:Common.css"
if old.body != minified.strip
    puts "Updating usi.css on wiki..."
    client.action(:edit, title: "MediaWiki:Common.css", text: css, summary: "[BOT] Updating to newest usi.css", bot: true) unless local
else
    puts "CSS file is up to date."
end

# tools
upToDate = true
Dir.entries("../tools").each do |f|
    if f != "." and f != ".."
        name = f.split(".")[0]
        content = File.read("../tools/#{f}")
        old = client.get_wikitext "Tool:#{name}"
        if old.body != content.strip
            puts "Updating Tool:#{f} on wiki..."
            client.action(:edit, title: "Tool:#{name}", text: content, summary: "[BOT] Updating to newest #{f}", bot: true) unless local
            upToDate = false
        end
    end
end

if upToDate
    puts "Tools are up to date."  
end
