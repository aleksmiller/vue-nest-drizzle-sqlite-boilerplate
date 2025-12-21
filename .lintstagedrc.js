module.exports = {
  'client/**/*.{ts,tsx,vue,js,jsx,json,css,scss,md}': (filenames) => {
    // Strip 'client/' prefix for ESLint since it runs from client directory
    const eslintFiles = filenames
      .filter((file) => /\.(ts|tsx|vue|js|jsx)$/.test(file))
      .map((file) => file.replace(/^client\//, ''))
      .join(' ')
    
    const commands = [
      `prettier --check --config client/.prettierrc.json ${filenames.join(' ')}`,
    ]
    
    // Only run ESLint on JS/TS/Vue files
    if (eslintFiles) {
      commands.push(`cd client && eslint --fix --cache ${eslintFiles}`)
    }
    
    return commands
  },
  'server/**/*.{ts,js,json}': (filenames) => {
    // Strip 'server/' prefix for ESLint since it runs from server directory
    const eslintFiles = filenames
      .filter((file) => /\.(ts|js)$/.test(file))
      .map((file) => file.replace(/^server\//, ''))
      .join(' ')
    
    const commands = [
      `prettier --check --config server/.prettierrc ${filenames.join(' ')}`,
    ]
    
    // Only run ESLint on TS/JS files
    if (eslintFiles) {
      commands.push(`cd server && eslint --fix ${eslintFiles}`)
    }
    
    return commands
  },
}

