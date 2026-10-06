"use client";

import { useMutation } from "convex/react";

import { api } from "@/convex/_generated/api";

import { getParticipantId } from "@/lib/participant";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

import { useState } from "react";

export function ReadingTask() {
  const router = useRouter();

  const participantId =
    getParticipantId();

  const saveText =
    useMutation(
      api.participants
        .savePage4Text,
    );

  const completePage =
    useMutation(
      api.participants.completePage,
    );

  const [finished, setFinished] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  async function handleFinish() {
    if (!participantId || !finished) {
      return;
    }

    setLoading(true);

    try {
      await saveText({
        participantId:
          participantId as any,

        text:
          "Condition A: participant read the assigned text.",
      });

      await completePage({
        participantId:
          participantId as any,

        page: 4,
        nextPage: 5,
      });

      router.push("/writing");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl p-6">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">
          Reading task
        </h1>

        <div className="rounded-xl border p-6 leading-7 space-y-4">
          <h2 className="text-2xl font-bold">Skanderbeg: His Life and Legacy</h2>

          <h3 className="pt-2 text-xl font-semibold">His name</h3>
          <p>
            The man known today as Skanderbeg was born Gjergj Kastrioti. Gjergj is the Albanian form of George. He belonged to the Kastrioti family, an Albanian noble house first recorded in history at the end of the fourteenth century. The family name probably comes from one of several fortified villages called Kastriot or Kastrat, a name that goes back to the Latin word castrum, meaning fort. The family also used the name Mazreku, which means “horse breeder” in Albanian and pointed to their clan membership.
          </p>
          <p>
            His name appears in many languages, reflecting the mixed world he lived in. His Italian letters call him Giorgio, Slavic documents call him Đurađ or Gjurgj, and his official Latin seal reads Georgius Castriotus Scanderbego. The name the world remembers came from the Ottoman Turks, who called him İskender Bey, meaning “Lord Alexander.” Most historians believe this compared his military skill to that of Alexander the Great. In Albanian he is Skënderbeu. Remarkably, he kept this Turkish-given name even after he turned against the Ottomans. His descendants in Italy later called themselves Castriota-Scanderbeg. In his surviving documents he claimed only one title, Dominus Albaniae, “Lord of Albania.”
          </p>

          <h3 className="pt-2 text-xl font-semibold">Childhood and family</h3>
          <p>
            Skanderbeg was born around 1405. Historians now largely agree on that year, although no birth records survive. His exact birthplace is debated; one leading biographer places it in the small village of Sinë, owned by his grandfather. His father, Gjon Kastrioti, ruled lands in north-central Albania between Lezhë and Prizren. His mother, Voisava, is also a subject of debate. Some sources describe her as a Slavic noblewoman from the Polog region, while others claim she came from the Albanian Muzaka family. Skanderbeg was the youngest of four sons, with three older brothers, Stanisha, Reposh, and Constantine, and he had five sisters.
          </p>
          <p>
            His father survived in a dangerous world by switching allegiances, and even religions, as circumstances required. He allied at times with Catholic Venice and at times with Orthodox Serbia. Eventually he became a vassal of the Ottoman sultan, paying tribute and supplying soldiers for Ottoman campaigns.
          </p>

          <h3 className="pt-2 text-xl font-semibold">A hostage who became an Ottoman commander</h3>
          <p>
            As was customary for lords under Ottoman control, Gjon had to send sons to the sultan’s court as hostages. Modern historians believe Skanderbeg was sent at around the age of 18, in about 1423, to the court of Sultan Murad II in Adrianople. He was not imprisoned. He converted to Islam, trained at the elite Enderun palace school, and served as a young attendant at the sultan’s court.
          </p>
          <p>
            He went on to a successful Ottoman career. The sultan granted him land near his father’s territories, which worried his father, who feared the sultan might order his own son to seize the family’s lands. In 1428 Gjon even had to apologise to Venice because Skanderbeg had fought in Ottoman campaigns against Christians. Stories later told of a young Skanderbeg defeating a boastful Tatar warrior in a duel before the sultan and winning his favour. When other Albanian lords rebelled against the Ottomans in 1432–1436, Skanderbeg stayed loyal to the sultan, even though relatives urged him to come home.
          </p>
          <p>
            He continued to rise. Around 1437–38 he governed the area of Krujë, and in 1440 he was appointed sanjakbey (governor) of Dibra. He probably also fought in Ottoman campaigns against the Hungarian commander John Hunyadi. Throughout this time he kept close ties with the people of his father’s old lands and with other Albanian noble families. His father died in 1437, and by then his brothers Reposh and Constantine had also died.
          </p>

          <h3 className="pt-2 text-xl font-semibold">The break with the Ottomans (1443)</h3>
          <p>
            In November 1443, during the Battle of Niš against Hunyadi’s crusaders, Skanderbeg deserted the Ottoman army along with about 300 Albanian soldiers. He rode straight to Krujë. There, using a forged letter supposedly from the sultan, he persuaded the Ottoman governor to hand over the fortress, and he became lord of the city on 28 November. He then took several nearby castles. According to tradition, he raised a red flag bearing a black double-headed eagle over Krujë, a symbol much like the flag of Albania today.
          </p>
          <p>
            He renounced Islam and returned to Christianity. He also demanded that converts and Muslim settlers in his lands become Christians or face death. From then on, the Ottomans called him “treacherous İskender.”
          </p>

          <h3 className="pt-2 text-xl font-semibold">The League of Lezhë and first victories</h3>
          <p>
            On 2 March 1444, Skanderbeg gathered Albanian noblemen in the Venetian-held town of Lezhë. There they formed a military alliance known as the League of Lezhë. It included the powerful Arianiti, Dukagjini, Muzaka, Thopia, and other families, as well as the Serbian lord Stefan Crnojević. For the first time, much of Albania was united under a single leader. However, Skanderbeg fully commanded only the soldiers from his own lands. He had to persuade the other lords to follow his plans.
          </p>
          <p>
            His forces were small, usually about 10,000 to 15,000 men. He fought a mobile, guerrilla-style war in the mountains, using ambushes and quick attacks to wear down much larger Ottoman armies. In the summer of 1444, at the Plain of Torvioll, he defeated an Ottoman army of about 25,000 by hiding cavalry in a forest and springing a surprise encirclement. News of the victory spread across Europe, because Ottoman armies were rarely defeated in open battle on European soil. Further victories followed in 1445 and 1446.
          </p>

          <h3 className="pt-2 text-xl font-semibold">Conflict with Venice (1447–1448)</h3>
          <p>
            At first, Venice supported Skanderbeg as a useful buffer against the Ottomans. As he grew more powerful, Venice began to see him as a threat. A dispute over the fortress of Dagnum led to war in 1447. Venice offered a lifetime pension to anyone who would kill him and encouraged the Ottomans to attack him from the east. In 1448 the Ottomans besieged the castle of Sfetigrad, and the garrison surrendered after its water supply failed. Meanwhile, Skanderbeg defeated a Venetian army near Shkodër and an Ottoman army at Oranik. Peace with Venice was signed in October 1448.
          </p>
          <p>
            He then set out to join Hunyadi’s crusade against the Ottomans in Kosovo but was blocked on the way, probably by the Serbian ruler Đurađ Branković. Hunyadi’s army was defeated before Skanderbeg could arrive. In anger, Skanderbeg raided Serbian lands in punishment.
          </p>

          <h3 className="pt-2 text-xl font-semibold">The first siege of Krujë (1450)</h3>
          <p>
            In June 1450, Sultan Murad II and his son Mehmed besieged Krujë with an enormous army. Skanderbeg left a garrison of 1,500 men inside under his trusted commander Vrana Konti. With the rest of his army, he attacked Ottoman supply lines from the mountains. The defenders held off three major assaults, and Vrana Konti rejected a large bribe to surrender. By autumn, disease and low morale had spread through the Ottoman camp, and in October the sultan withdrew. Murad died a few months later.
          </p>
          <p>
            The victory made Skanderbeg famous throughout Europe, but it left him exhausted and nearly penniless. Many Albanian nobles had sided with the Ottomans, and he held little besides Krujë. With help from Ragusa (Dubrovnik) and the Pope, he gradually rebuilt his position.
          </p>

          <h3 className="pt-2 text-xl font-semibold">Alliance with Naples and marriage</h3>
          <p>
            Skanderbeg now turned to King Alfonso V of Aragon and Naples, Venice’s rival in the Adriatic. In the Treaty of Gaeta of March 1451, Skanderbeg formally accepted the king’s overlordship in exchange for military and financial help. In practice he remained independent. A month later he married Donika (Andronika), daughter of the powerful lord Gjergj Arianiti, at the Orthodox monastery of Ardenica, strengthening his alliances at home.
          </p>

          <h3 className="pt-2 text-xl font-semibold">Victories, betrayals, and setbacks</h3>
          <p>
            The new sultan, Mehmed II, sent several armies against Albania in the early 1450s, and Skanderbeg defeated them. In 1455, however, he suffered his worst defeat. After besieging the fortress of Berat for months, he left part of his army camped by the Osum River while waiting for the garrison to surrender. Ottoman reinforcements took them by surprise and killed about 5,000 Albanian cavalrymen.
          </p>
          <p>
            Betrayal was a constant danger. The commander Moisi Golemi defected to the Ottomans and returned leading an army against Skanderbeg. He was defeated, then asked for forgiveness, and Skanderbeg pardoned him; he remained loyal afterwards. A nephew sold a fortress to the Ottomans. Most painfully, after Skanderbeg’s son Gjon was born in 1456, his nephew and close companion Hamza Kastrioti lost his hope of inheriting and defected to the sultan.
          </p>
          <p>
            In 1457 a huge Ottoman army invaded Albania, guided by Hamza, who knew all of Skanderbeg’s tactics. Skanderbeg avoided battle for months, letting his enemies believe he was beaten. Then, on 2 September, at Albulena, he attacked their camp and won one of his most famous victories. Hamza was captured and sent to Naples. Pope Calixtus III named Skanderbeg Captain-General of the Holy See and gave him the title Athleta Christi, “Champion of Christ.”
          </p>

          <h3 className="pt-2 text-xl font-semibold">The Italian expedition (1460–1462)</h3>
          <p>
            After King Alfonso died in 1458, his son Ferdinand I faced a rebellion in southern Italy. Skanderbeg repaid his debt to Naples. He made a truce with the Ottomans and in 1461 landed in Apulia with about 3,000 soldiers, helping to defeat Ferdinand’s enemies and secure his throne. When the rebel Prince of Taranto mocked the Albanians, Skanderbeg replied proudly that they were descendants of the ancient Epirotes and of King Pyrrhus, who had once conquered much of Italy. Ferdinand remained grateful for the rest of his life and later gave estates in Italy to Skanderbeg’s family.
          </p>

          <h3 className="pt-2 text-xl font-semibold">The last wars</h3>
          <p>
            Back in Albania, Skanderbeg defeated several more Ottoman armies, forcing Mehmed II to agree to a ten-year truce in 1463. That same year, Venice went to war with the Ottomans and became Skanderbeg’s ally. Pope Pius II planned a great crusade, with Skanderbeg as a chief commander, so Skanderbeg returned to war. But the Pope died in August 1464, just as the armies were gathering, and the crusade never took place. Skanderbeg again stood almost alone.
          </p>
          <p>
            The fighting grew more brutal. In 1465 the Ottoman commander Ballaban Pasha, himself of Albanian origin, captured several of Skanderbeg’s leading officers, including Moisi Golemi. They were taken to Constantinople and executed. In revenge, Skanderbeg later had Ottoman prisoners killed.
          </p>
          <p>
            In 1466 Mehmed II personally led a second siege of Krujë. When the fortress again held out, he left Ballaban Pasha behind to continue the siege and built a new fortress, Elbasan, nearby. Skanderbeg spent that winter in Italy asking for help. In Rome he was so short of money that he could not pay his lodging, and he remarked bitterly that he ought to be fighting the Church rather than the Ottomans. On his return, he allied with Lekë Dukagjini, and in April 1467 they broke the siege. Ballaban was killed, and Skanderbeg entered Krujë in triumph. Mehmed invaded again that summer and devastated the country, but Krujë held for a third time.
          </p>

          <h3 className="pt-2 text-xl font-semibold">Death</h3>
          <p>
            By then Albania was in ruins, its population had suffered heavily, and many nobles had been lost. In January 1468, Skanderbeg called the remaining Albanian lords to Lezhë to plan the next stage of the war. There he fell ill, probably with malaria. He died on 17 January 1468, aged about 62, and was buried in the church of St. Nicholas in Lezhë. King Ferdinand wrote to his widow, mourning the loss of a friend.
          </p>
          <p>
            Without him, the resistance slowly collapsed. Krujë fell in 1478 after a year-long siege, and Shkodër fell in 1479. His son Gjon and later his grandson tried to continue the fight, without lasting success. Many Albanians fled to southern Italy, where their descendants, the Arbëreshë, still live today.
          </p>

          <h3 className="pt-2 text-xl font-semibold">Why he is still remembered</h3>
          <p>
            For twenty-five years, Skanderbeg was one of the most persistent opponents of the Ottoman Empire at the height of its power. He repeatedly defeated much larger armies and slowed Ottoman expansion toward Italy and Western Europe. Historians note that others also played a major role in this, including Hunyadi, Vlad III of Wallachia, and Stephen the Great of Moldavia. They also note that, because Europe gave him little support, his victories could not permanently stop the Ottomans.
          </p>
          <p>
            He was already a hero in his own lifetime, and his fame grew after his death. His enemies respected him too: according to legend, when Ottoman soldiers found his grave, they made amulets from his bones, believing they would bring courage. Stories grew around him, claiming that he slept only five hours a night and could cut a man in two with a single stroke. Centuries later, the British general James Wolfe praised him as the finest commander of a small defensive army.
          </p>
          <p>
            Europe turned him into a symbol of Christian resistance. Marin Barleti’s Latin biography of 1508 spread his story widely. Vivaldi wrote an opera about him, several English plays were written in his honour, and writers such as Voltaire, Byron, and Longfellow admired him.
          </p>

          <h3 className="pt-2 text-xl font-semibold">His influence on Albanian culture</h3>
          <p>
            For Albanians, Skanderbeg is far more than a historical figure; he is the national hero. Among the Arbëreshë in Italy, his memory survived for centuries in folk songs, known as the Skanderbeg cycle. In the nineteenth century, during the Albanian National Awakening, he became the central symbol of the movement for independence. He stood for unity, freedom, and the sacrifice of the Albanian people, and for Albania’s connection to Europe. The first Albanian-language poem about him was published in 1898.
          </p>
          <p>
            His legacy is visible everywhere. Albania’s flag, a black double-headed eagle on red, echoes the banner associated with him. Tirana’s main square bears his name and his statue, and further monuments stand in Krujë, Pristina, Skopje, Rome, Geneva, Brussels, and London. A museum stands beside Krujë Castle, and a military university, a football stadium, and a state order are named after him. A 1953 film about his life won a prize at the Cannes Film Festival.
          </p>
          <p>
            Although he fought as a Christian, Albania today is largely Muslim. Many Albanians of all faiths therefore see him mainly as a defender of the nation rather than of a religion. For them he represents Albanian identity itself.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={finished}
            onChange={(event) =>
              setFinished(
                event.target.checked,
              )
            }
          />

          <label>
            I have finished reading the
            text.
          </label>
        </div>

        <div className="flex justify-between border-t pt-6">
          <Button
            variant="outline"
            onClick={() =>
              router.push(
                "/instructions",
              )
            }
          >
            ← Previous
          </Button>

          <Button
            disabled={
              !finished || loading
            }
            onClick={handleFinish}
          >
            {loading
              ? "Saving..."
              : "I've finished →"}
          </Button>
        </div>
      </div>
    </main>
  );
}