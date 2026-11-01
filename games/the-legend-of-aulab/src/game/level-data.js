export const TILE_SIZE = 64

export const LEVEL_ROWS = [
  '                                                                                                                                                                                                                                                                                                                                                         G',
  '                                                                                                                                                                                                                                                                                                                            a c c a                      G',
  '                                                                                                                                                                                                     L     %                                                                                                               --------                      G',
  '                                                                                 c                                                                                                            ===================   c                                                                                                    -                               G',
  '                                       c                                    c   --                                                                                     c      --  --  --  --                        ---  c                            == %                                                             -                                 G',
  '                                  c    ==                              c    --                                                                              c     ===========                                          ---  a                       ======                                                           -                                   G',
  '                            c     ==   ==                              --                                                                                 ======                                                          ---  L              ^ ==============                                                    -                              ======= G',
  '            c     ^         ==  L ==   ==           %            %                 ^                                                 c              =====                                                                      =====      L ======================                                             -                           ============= G',
  '========================================= -  ===========LL================^%===============  ====                          a  =============  ====                                                                                     ==================================                   a           c                     ^       =================== G',
  '=========================================    ==============================================  ====   --  --  --   --  --  ==================                                                                                      ===========================================   =====^L==========%%=============  ====  ==================================G',
]

export function compileLevel(rows = LEVEL_ROWS, chunkSize = 8) {
  if (!Number.isInteger(chunkSize) || chunkSize < 1) throw new Error('Invalid chunk size')
  const objects = []
  const goals = new Set()
  rows.forEach((row, y) => {
    for (let x = 0; x < row.length;) {
      const symbol = row[x]
      if (symbol === ' ') { x++; continue }
      if (symbol === 'G') {
        if (!goals.has(x)) {
          goals.add(x)
          objects.push({ symbol, x: x * TILE_SIZE, y: 0, count: 1 })
        }
        x++
        continue
      }
      let count = 1
      if (symbol === '=' || symbol === '-') {
        while (row[x + count] === symbol && count < chunkSize) count++
      }
      objects.push({ symbol, x: x * TILE_SIZE, y: y * TILE_SIZE, count })
      x += count
    }
  })
  return objects.sort((a, b) => a.x - b.x)
}
