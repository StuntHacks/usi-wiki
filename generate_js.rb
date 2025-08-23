require "clipboard"

files = []
js = ""

Dir.entries(".").each do |f|
    files.push f
end

files.each do |f|
    puts f
    if f != "." and f != ".."
        split = f.split("_")
        js += "icons_svgs[\"#{split[1].split(".")[0]}\"] = '#{File.read("./" + f).strip}';\n".gsub(' style="height: 512px; width: 512px;"', "")
    end
end

Clipboard.copy js
