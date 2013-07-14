class CreatePlayers < ActiveRecord::Migration
  def change
    create_table :players do |t|
      t.integer :order
      t.integer :user_id
      t.integer :game_id

      t.timestamps
    end
    add_index :players, [:user_id, :game_id]
  end
end
