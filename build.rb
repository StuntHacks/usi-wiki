require "uglifier"
require "mediawiki_api"
require "dotenv"
require "digest"

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
        f = f.gsub(".png", "")
        split = f.split("_")
        markup = File.read("./" + f).strip
        name = split[1]
        tmp = "icons_svgs[\"#{name}\"] = '#{markup}';\n"
        js += tmp.gsub(' style="height: 512px; width: 512px;"', "").gsub('<?xml version="1.0" encoding="utf-8"?>', "")
    end
end

# enemies
puts "Verifying enemy PNGs..."
upToDate = true
Dir.entries("../png/enemies").each do |f|
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

        response = client.query titles: "File:#{wikiPath}", prop: "imageinfo", iiprop: "url|sha1"

        pages = response.data["pages"]
        page = pages.values.first

        if page["imageinfo"] and !page.key?("missing")
            if page.dig('imageinfo', 0, 'sha1') != Digest::SHA1.file(path).hexdigest
                puts "Updating #{wikiPath}..."
                client.delete_page wikiPath, "[BOT] Deleting outdated icon" unless local
                client.upload_image wikiPath, path, "[BOT] Updating enemy icon", "ignorewarnings" unless local
                upToDate = false
            end
        else
            puts "Adding #{wikiPath}..."
            client.upload_image wikiPath, path, "[BOT] Adding new enemy icon", false unless local
            upToDate = false
        end

        markup = "<img src=\"#{}\" alt=\"#{type} #{name}\" />"
        js += "enemy_pngs[\"#{name}\"] = '#{markup}';\n"
    end
end

if upToDate
    puts "Enemy PNGs are up to date."
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
base = File.read "../html/base_showcase.html"

output = {
    :general => "",
    "Shards" => "=== Shards ===\n",
    "Synth" => "=== Synth Materials ===\n",
    "Achievement" => "=== Achievement Exclusive ===\n",
    "Alien" => "=== Specimen & Alien Mats ===\n",
    :base => base,
    :enemies => "=== Enemies ===\n",
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
