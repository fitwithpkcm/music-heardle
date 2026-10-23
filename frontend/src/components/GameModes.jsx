const routes={pictures:'picture-game',song:'song-game',dialogue:'dialogue-game',clues:'clue-game',lyrics:'lyrics-game'}
export default function GameModes({game,buzzer=false}){
 if(game==='song')return <nav className="game-modes game-modes-compact" aria-label="Play mode">
 <a href="#song-game" aria-current={!buzzer?'page':undefined}>Normal</a>
 <a href="#buzzer-game?game=song" aria-current={buzzer?'page':undefined}>Buzzer</a>
 </nav>
 return <nav className="game-modes game-modes-compact" aria-label="Play mode">
 <a href={`#${routes[game]}`} aria-current={!buzzer?'page':undefined}>{game==='lyrics'?'Host / online play':'Normal'}</a>
 <a href={`#buzzer-game?game=${game}`} aria-current={buzzer?'page':undefined}>Buzzer</a>
 </nav>
}
