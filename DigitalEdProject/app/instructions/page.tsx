"use client";

import { useMutation } from "convex/react";

import { api } from "@/convex/_generated/api";

import { useRouter } from "next/navigation";

import { ParticipantGuard } from "@/components/experiment/ParticipantGuard";

import { PageNavigation } from "@/components/experiment/PageNavigation";

import { getParticipantId } from "@/lib/participant";

import albaniaMap from "./albania-map.png";

export default function InstructionsPage() {
  const router = useRouter();

  const participantId =
    getParticipantId();

  const completePage =
    useMutation(
      api.participants.completePage,
    );

  return (
    <ParticipantGuard>
      <main className="mx-auto max-w-3xl p-6">
        <div className="space-y-6">
          <h1 className="text-3xl font-bold">
            Instructions
          </h1>

          <div className="rounded-xl border p-6 leading-7 space-y-4">
            <h2 className="text-2xl font-bold">Europe in the 1400s</h2>
            <p>
              In the first half of the fifteenth century, southeastern Europe was being controlled by the Ottoman Empire. The Muslim state had begun in Anatolia (modern Turkey) and had spent decades pushing into the Balkan Peninsula. It was ruled by a sultan, first Murad II and later his son Mehmed II, from the city of Adrianople (Edirne). The once-great Byzantine Empire had shrunk to little more than its capital, Constantinople. When Mehmed II captured that city in 1453, it shocked Christian Europe and made the Ottomans the dominant power in the region.
            </p>

            <h3 className="pt-2 text-xl font-semibold">The situation of Albania</h3>
            <img
              src={"https://commons.wikimedia.org/wiki/File:Venice1400.png"}
              alt="Placeholder: Map of Albania in the 15th century"
              width={600}
              height={400}
              className="h-auto max-w-full rounded-lg"
            />
            <p>
              On the map, Albania lies along the eastern shore of the Adriatic Sea, directly across from the “heel” of Italy. It included provinces such as Valona, Corja and Mat. This made it a frontier: Ottoman lands lay to the east, and the Italian states were only a short sea crossing to the west.
            </p>
            <p>
              At the time, Albania was not a unified state. The land was divided among powerful noble families, each ruling its own territory from castles in the mountains and valleys. These families included the Kastrioti, Arianiti, Dukagjini, Muzaka, and Thopia. They were rivals as often as allies, and they changed sides when it suited them. Many had become vassals of the Ottoman sultan. They paid him tribute and sent soldiers to fight in his wars in exchange for keeping their lands. Skanderbeg’s father, Gjon Kastrioti, was one such lord.
            </p>

            <h3 className="pt-2 text-xl font-semibold">The neighbouring powers</h3>
            <p>Several outside powers had interests in Albania:</p>
            <ul>
              <li>The Republic of Venice was a wealthy trading state that controlled many coastal towns. Venice cared mainly about trade and security, so it was sometimes an ally of the Albanian lords and sometimes a rival.</li>
              <li>The Kingdom of Naples ruled southern Italy under the Aragonese kings Alfonso V and later Ferdinand I. It became Skanderbeg’s most reliable supporter.</li>
              <li>The Pope in Rome repeatedly called for a crusade against the Ottomans, but he could offer more encouragement than money or soldiers.</li>
              <li>Wallachia, led by the general John Hunyadi, was the main Christian military force fighting the Ottomans further north along the Danube.</li>
              <li>Serbia was caught between the two sides and often forced to cooperate with the sultan.</li>
            </ul>

            <h3 className="pt-2 text-xl font-semibold">Hostages and careers</h3>
            <p>
              A common Ottoman practice was to require defeated or subordinate lords to send a son to the sultan’s court as a hostage. This ensured the father’s loyalty. The hostages were not kept in prison, however. They were often educated at the elite palace school (the Enderun), converted to Islam, and trained as officers and administrators. Some rose to high positions. Skanderbeg, born around 1405, was sent to the court as a young man. He served the Ottomans for about twenty years and became governor (sanjakbey) of the district of Dibra in 1440.
            </p>

            <h3 className="pt-2 text-xl font-semibold">Religion and identity</h3>
            <p>
              In this borderland, religion and loyalty were more flexible than we might expect. Skanderbeg’s family had been Orthodox or Catholic Christian depending on which ally they needed. Skanderbeg himself was raised Orthodox, lived as a Muslim in Ottoman service, and later became a Catholic. His court was multilingual, and his letters were written in Latin, Italian, Greek, and Slavic.
            </p>

            <h3 className="pt-2 text-xl font-semibold">How war worked</h3>
            <p>
              Ottoman armies were very large and well supplied. The Albanian lords had much smaller forces, but they knew the mountainous terrain. Fighting centred on castles, such as the fortress of Krujë, and on cavalry raids, ambushes, and cutting enemy supply lines. News and diplomacy moved slowly, carried by messengers and envoys by land and across the sea.
            </p>

            <p className="mt-4">
              Read the text carefully before you continue.
            </p>
          </div>

          <PageNavigation
            previousHref="/questionnaire"
            nextDisabled={!participantId}
            onNext={async () => {
              await completePage({
                participantId:
                  participantId as any,

                page: 3,
                nextPage: 4,
              });

              router.push("/task");
            }}
          />
        </div>
      </main>
    </ParticipantGuard>
  );
}