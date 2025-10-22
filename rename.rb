Dir.entries(".").each do |filename|
  next unless match = filename.match(/^enemy(?<color>[A-Za-z]+)(?<number>\d+)\.png$/)
  color  = match[:color]
  number = match[:number].to_i

  classes = {
    "Red"     => "Armor",
    "Blue"    => "Shield",
    "Green"   => "Mixed",
    "Black"   => "Hull",
    "DeepRed" => "Phasing",
    "Purple"  => "MixedPhasing",
    "Teal"    => "Regen",
  }

  types = {
    1 => "Fighter",
    2 => "Skirmisher",
    3 => "Sniper",
    4 => "Juggernaut",
    5 => "Frigate",
    7 => "Gatling",
    8 => "Missiles",
    10 => "Bulwark",
  }

  next if (types[number].nil? || classes[color].nil?)
  File.rename filename, "#{types[number]}_#{classes[color]}.png"
end
