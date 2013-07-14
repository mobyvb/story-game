class CreateGames < ActiveRecord::Migration
  def change
    create_table :games do |t|
      t.string :name
      t.integer :current_player
      t.integer :turns

      t.timestamps
    end
  end
end
