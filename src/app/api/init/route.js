export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        is_admin BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW(),
        last_seen TIMESTAMP DEFAULT NOW()
      );
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS poems (
        id SERIAL PRIMARY KEY,
        title VARCHAR(500) NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS likes (
        id SERIAL PRIMARY KEY,
        poem_id INTEGER REFERENCES poems(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(poem_id, user_id)
      );
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS comments (
        id SERIAL PRIMARY KEY,
        poem_id INTEGER REFERENCES poems(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    const existingPoems = await query('SELECT COUNT(*) FROM poems');
    if (parseInt(existingPoems.rows[0].count) === 0) {
      const poems = [
        {
          title: 'Victoria',
          content: `Victoria, nombre que el viento pronuncia
cuando sopla suave entre las flores,
nombre que el alma entera anuncia
como el más bello de todos los nombres.

Hay algo en ti que no tiene nombre,
algo que va más allá del lenguaje,
algo que nace sin que nadie lo asombre
y que hace del amor un hermoso viaje.

Eres victoria en cada sentido:
ganaste sin luchar mi corazón,
sin armas, sin ruido, sin estruendo,
solo con tu sonrisa y tu canción.

Y en esta batalla que es quererte,
me rindo dichoso de perderme en ti.`
        },
        {
          title: 'Soneto del Amor Eterno',
          content: `Cuando el cielo nocturno pierde su brillo
y las estrellas callan su canción,
en mi pecho despierta un murmullo
que lleva grabado tu nombre y tu voz.

No hay palabras que basten para describirte,
ni versos que alcancen tu altura,
solo sé que el destino quiso escribirte
como la razón de mi hermosura.

Eres el alba que nace serena,
la brisa que calma mi dolor,
la melodía que el viento envenena
de esperanza, de vida, de amor.

Y así, con cada latido que siento,
te amo más allá del tiempo.`
        },
        {
          title: 'En Tus Ojos',
          content: `He buscado el universo entero
en mapas de sueños y estrellas,
y lo encontré completo y verdadero
en el cielo azul de tus pupilas bellas.

En tus ojos vive el amanecer,
la promesa de días mejores,
donde quiero perderme y renacer
entre jardines llenos de colores.

No necesito más tierra ni cielo
si en tu mirada está mi hogar,
en tus ojos encuentro el vuelo
y las ganas eternas de amar.

Dime que me ves como yo te veo:
como el milagro más grande del deseo.`
        },
        {
          title: 'Carta al Amor',
          content: `Si pudiera escribirte con luz de luna
cada palabra que el corazón me dicta,
llenara el mar sin dejar ninguna
de las razones por las que me conquista.

Me conquistas con tu risa franca,
con tu manera de ver el mundo,
con esa luz tuya que nunca se estanca
y que me lleva a un amor profundo.

No sé si el amor llega por destino
o si simplemente uno lo elige,
pero sé que en mi propio camino
eres tú quien guía y quien dirige.

Quédate aquí donde siempre te espero,
en mi vida, mi alma, y todo lo que quiero.`
        },
        {
          title: 'Primavera de tu Presencia',
          content: `Donde tú estás florece la primavera
aunque afuera el invierno sea frío,
tu presencia es la luz más verdadera
que ilumina este corazón tardío.

Tardío porque tardé en entenderlo,
en comprender que eras tú mi destino,
tardío porque quise fingir que verlo
no me hacía sentir algo divino.

Pero ya no puedo más con el silencio,
ni con guardar lo que el pecho derrama,
este amor que crece con recomencio
es tan real como el sol de la mañana.

Victoria, eres mi primavera eterna,
la razón que mi corazón gobierna.`
        },
        {
          title: 'El Mar y Tú',
          content: `El mar no sabe contenerse
cuando ve la luna en el cielo,
y yo tampoco puedo detenerme
cuando pienso en ti y en tu pelo.

Hay una marea que me jala
hacia el lugar donde tú estás,
una corriente que me arrastra y me iguala
con la certeza de que sin ti me pierdo más.

Como el mar besa eternamente
la orilla que no puede poseer,
así te amo yo en silencio y pacientemente,
con el deseo inmenso de poderte ver.

Soy el mar que te busca sin descanso,
tú eres la orilla donde encuentro mi remanso.`
        }
      ];

      for (const poem of poems) {
        await query('INSERT INTO poems (title, content) VALUES ($1, $2)', [poem.title, poem.content]);
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: '✨ Base de datos inicializada correctamente. ¡La web de Victoria está lista!' 
    });
  } catch (error) {
    console.error('Init error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
