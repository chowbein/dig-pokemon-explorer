/**
 * Application Routes
 * Defines all routes for the Pokemon Explorer application using react-router-dom.
 */

import { Routes, Route } from 'react-router-dom';
import { PokemonListPage } from '../pages/PokemonListPage';
import { PokemonDetailPage } from '../pages/PokemonDetailPage';

/**
 * Application routes component.
 * Defines routing structure for Pokemon Explorer.
 * 
 * Routes:
 * - /: Pokemon list page with filtering and infinite scroll
 * - /pokemon/:name: Pokemon detail page for individual Pokemon
 */
export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<PokemonListPage />} />
      <Route path="/pokemon/:name" element={<PokemonDetailPage />} />
    </Routes>
  );
}

