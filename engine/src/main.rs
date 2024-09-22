struct Board {
    mailbox: [[u8; 25]; 2],
}

struct PositionKey {
    data: [u32; 0],
}

struct Move {
    an_move: [u32; 0],
    key: PositionKey,
}

struct MoveList {
    c_moves: u32,
    c_max_moves: u32,
    c_max_pips: u32,
    am_moves: [Move; 0],
}

impl Board {
    fn starting_position() -> Self {
        Self {
            mailbox: [
                [0, 0, 0, 0, 0, 5, 0, 3, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0],
                [0, 0, 0, 0, 0, 5, 0, 3, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0],
            ],
        }
    }

    fn apply_sub_move(&self, i_src: u8, n_roll: u8) {
    }

    fn save_moves(&self, pml: &mut MoveList, c_moves: u8, c_pip: u8, an_moves: &mut [u8; 8]) {
        if c_moves < pml.c_max_moves || c_pip < pml.c_max_pips {
            return
        }

        if c_moves > pml.c_max_moves || c_pip > pml.c_max_pips {
            pml.c_moves = 0
        }

        pml.c_max_moves = c_moves;
        pml.c_max_pips = c_pip;

        let key = {
            data: [0, 0, 0, 0, 0, 0, 0]
        };
        // TODO
    }

    fn legal_move(&self, i_src: u8, n_pips: u8) -> bool {
        let i_dest = i_src - n_pips;

        if i_dest >= 0 {
            return self.mailbox[0][usize::from(23 - i_dest)] < 2
        }

        // TODO
        false
    }

    fn legal_turns_sub(&self, pml: &mut MoveList, an_roll: [u8; 4], n_move_depth: u8, i_pip: u8, c_pip: u8, an_moves: &mut [u8; 8]) -> bool {
        if n_move_depth == 4 || an_roll[usize::from(n_move_depth)] == 0 {
            return true
        }

        let mut f_used = false;

        if self.mailbox[1][24] > 0 {
            if self.legal_move(24, an_roll[usize::from(n_move_depth)]) {
                an_moves[usize::from(n_move_depth * 2)] = 24;
                an_moves[usize::from(n_move_depth * 2 + 1)] = 24 - an_roll[usize::from(n_move_depth)];

                let an_board_new = Board {
                    mailbox: self.mailbox.clone()
                };

                an_board_new.apply_sub_move(24, an_roll[usize::from(n_move_depth)]);

                if an_board_new.legal_turns_sub(pml, an_roll, n_move_depth + 1, 23, c_pip + an_roll[usize::from(n_move_depth)], an_moves) {
                    an_board_new.save_moves(pml, n_move_depth + 1, c_pip + an_roll[usize::from(n_move_depth)], an_moves);
                }

                f_used = true;
            }
        } else {
            // TODO
        }

        !f_used
    }

    fn legal_turns(&self, die0: u8, die1: u8) -> MoveList {
        let mut an_roll = [die0, die1, if die0 == die1 { die0 } else { die1 }, if die0 == die1 { die0 } else { die1 }];
        let mut an_moves = [0, 0, 0, 0, 0, 0, 0, 0];

        let mut pml = MoveList {
            c_moves: 0,
            c_max_moves: 0,
            c_max_pips: 0,
            am_moves: [],
        };
        self.legal_turns_sub(&mut pml, an_roll, 0, 23, 0, &mut an_moves);

        if an_roll[0] != an_roll[1] {
            let n = an_roll[0];
            an_roll[0] = an_roll[1];
            an_roll[1] = n;

            self.legal_turns_sub(&mut pml, an_roll, 0, 23, 0, &mut an_moves);
        }
        pml
    }

    fn play_move(&self, an_move: [u32; 0]) {
    }
}

fn divide(board: Board, max_depth: u8) -> u32 {
    let mut total_turn_count = 0;
    for die0 in 1..=6 {
        for die1 in die0..=6 {
            let legal_turns = board.legal_turns(die0, die1);

            for legal_turn in legal_turns.am_moves {
                let board_new = Board {
                    mailbox: board.mailbox.clone()
                };
                board_new.play_move(legal_turn.an_move);
                let move_count = perft(board_new, max_depth - 1);
                total_turn_count += move_count;
            }
        }
    }
    return total_turn_count;
}

fn perft(board: Board, depth: u8) -> u32 {
    if depth == 0 {
        return 1
    }


    return 1000;
}

fn main() {
    let board = Board::starting_position();

    println!("{}", divide(board, 1));
}

