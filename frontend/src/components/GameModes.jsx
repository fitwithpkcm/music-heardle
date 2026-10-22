const routes={song:'song-game',dialogue:'dialogue-game',clues:'clue-game',lyrics:'lyrics-game'}
export default function GameModes({game,buzzer=false}){
 const normalLabel=game==='lyrics'?'Host':'Normal'
 return <nav className="game-modes" aria-label="Play mode">
 <a href={`#${routes[game]}`} aria-current={!buzzer?'page':undefined}>{normalLabel}</a>
 <span className={`game-modes-thumb ${buzzer?'is-buzzer':''}`} aria-hidden="true" />
 <a href={`#buzzer-game?game=${game}`} aria-current={buzzer?'page':undefined}>Buzzer</a>
 </nav>
}
