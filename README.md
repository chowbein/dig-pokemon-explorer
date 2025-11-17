# Pokemon Explorer

## Project Description
Pokemon Explorer is a web application that allows users to discover and learn about Pokemon. It provides a comprehensive list of Pokemon with infinite scrolling, advanced filtering options, and a detailed view for each Pokemon. Additionally, it features a team builder that enables users to create and analyze their own Pokemon team.

## Features
- **Infinite Scroll List:** Seamlessly browse through the entire list of Pokemon with an infinite scroll implementation.
- **Detail View:** Access in-depth information for each Pokemon, including their stats, abilities, moves, and evolution chain.
- **Team Builder:** Create your own team of up to six Pokemon and view a detailed analysis of your team's type strengths and weaknesses. The program recommends what you need to add or modify to the team depending on this information. To add a Pokemon to your team you can either click on a Pokemon and press the "Add to Team" button in the detailed view or drag it from the list and drop it into the team area.
- **Advanced Filtering:** Easily filter Pokemon by type or search for specific Pokemon by name to quickly find what you're looking for. Additionally, you can improve the team you built by clicking the filter icon next to any of the weaknesses and the Pokemon list will be filtered by that type's counter helping you decide what additions would improve your team's composition.
- **Habitat:** Know the habitat of each Pokemon through their background or through accessing their detailed view.

## Technologies Used
- **React:** A JavaScript library for building user interfaces.
- **TypeScript:** A typed superset of JavaScript that compiles to plain JavaScript.
- **Tailwind CSS:** A utility-first CSS framework for rapid UI development.
- **React Query:** A data-fetching library for fetching, caching, and updating data in React applications.
- **React Router:** A declarative routing library for React applications.

## Setup/Installation
1. Clone the repository: `git clone https://github.com/chowbein/dig-pokemon-explorer.git`
2. Navigate to the project directory: `cd dig-pokemon-explorer`
3. Install the dependencies: `npm install`

## How to Run
To start the development server, run the following command:
`npm run dev`

This will start the application on `http://localhost:5173` by default.

## Link to Vercel deployed app: `https://dig-pokemon-explorer.vercel.app/`

## Challenges Faced and Solutions

The entire app took ~10 hours to build and the most difficult part by far was trying to prioritize what was needed knowing full well that I won't be able to finish everything perfectly. A disciplined approach to choosing what's important to accomplish and not was key to addressing this. Specifically, I tried my best to make the end result something a person could actually make use of in addition to the requirements laid out. It is because of this that I chose to focus on implementing a team builder feature where the use case is a player trying to see and track what weaknesses and resistances their team currently has and provide them with an analysis on how it can be improved.

This brings me to the second challenge – usability. I have not played Pokemon in more than 10+ years (I played Pokemon Emerald in a Gameboy emulator) and forgot how most of this stuff worked. It is because of this that I was not able to truly validate the real usefulness of the app and had to review how to build the best possible way to build a team:

`https://www.quora.com/What-would-be-an-example-of-a-well-balanced-team-in-your-favorite-video-game-Pokémon-LoL-or-any-others-What-makes-it-so-balanced-How-do-you-counter-it-if-its-unbalanced`

`https://www.smogon.com/forums/threads/ultimate-balanced-team.3461643/`

`https://www.reddit.com/r/PokemonSwordAndShield/comments/14mlgra/is_my_team_balanced/`

Translating this into code was a separate issue. Ultimately, I tried to simplify the process by just using what the API provided in `https://pokeapi.co/api/v2/type/{id or name}/` (the type's damage_relations) and used that to build a custom hook, `useTeamTypeAnalysis`. This hook systematically calculates the team's overall defensive profile by:
1. Iterating through each Pokémon on the team.
2. Simulating an attack from every one of the 18 possible types.
3. Calculating a `final damage multiplier` for each simulated attack, which correctly handles the complex interactions of dual-type Pokémon (e.g., calculating a 4x weakness or a 0.25x resistance).
4. Aggregating these results to count how many team members are weak or resistant to each potential attack type.

This approach provided a clear, actionable analysis for the user, turning a complex set of game rules into a practical and useful feature. 

On the technical side, another challenge I faced was my inexperience and unfamiliarity with the tech stack. Admittedly, there were occassions where I had to ask the AI to explain what it made for me rather than me critiquing how it should be made instead. As a way to address this, I tried to make the code as simple as possible to understand and tried to modularize it so that I can better track every file in case issues arose.

Other technical challenges that I spent significant time on fixing are the background images (the habitats) of some Pokemon not appearing. I discovered this because when selecting filters (especially for Fairy, Dark, or Steel types), most Pokemon displayed had no backgrounds. Initially, I suspected it was due to too many concurrent API calls causing failures. However, I noticed that unfiltered Pokemon showed backgrounds consistently even after extensive scrolling, which indicated it wasn't an API rate-limiting issue.

Upon investigating the PokeAPI's `/pokemon-species/{name}` endpoint responses, I discovered that the `habitat` field returns `null` for most Generation V+ Pokemon. The API only has habitat data populated for approximately 60% of all Pokemon (mostly Gen I-IV), leaving newer generations without this information. I also discovered that scrolling enough times in the unfiltered list would eventually show the Pokemons that didn't have a background (habitat).

To solve this systematically, I built a **habitat inference system** (`habitatInference.ts`) that intelligently predicts habitats based on Pokemon type combinations:

1. **Type Combination Patterns (Priority 1):** The system contains 50+ type combination rules and 18 single-type fallback patterns, totaling 70+ habitat inference rules. For example:
   - Water + Flying → `waters-edge` (like Gyarados, Pelipper)
   - Rock + Ground → `cave` (like Onix, Golem)
   - Grass + Bug → `forest` (like Paras, Parasect)
   - Dragon + Ground → `mountain` (like Garchomp, Flygon)
   - Fairy types → `rare` (mystical/special locations)

2. **Single Type Fallbacks (Priority 2):** When no combination matches, it uses the primary type's most common habitat (Water → sea, Electric → urban, etc.)

3. **API Data Preference:** The system always uses official API habitat data when available, only inferring when the field is `null`

This solution provides contextually appropriate backgrounds for 100% of Pokemon across all filters and pages, enhancing the visual experience while working around the API's incomplete data. The inference logic is based on observable patterns from Pokemon that do have habitat data, making the predictions ecologically and thematically accurate. 

The last challenge faced is another technical one, particularly related to styling. This was my first time trying to use Tailwind and was not used to styling the elements inline with the elements (I got used to using class names and having a separate css file for all the styling). I realized this might be the tradeoff between the two methods and mainly addressed it by just learning the syntax and how it worked. I realized that this styling approach is better for more complex applications with frontend edge cases.